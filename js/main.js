import { canvasHeightPane, config, timing } from './ui.js';
import { device } from './util.js';
import { GPUPart } from './webgpupart.js';
import * as CPUPart from '../build/release.js';

let data1Ptr, data2Ptr;
function reset() {
  if (data1Ptr) CPUPart.freeRGBA(data1Ptr);
  data1Ptr = CPUPart.allocRGBA(config.canvasWidth * config.canvasHeight);
  CPUPart.generateSomeData(config.canvasWidth, config.canvasHeight, data1Ptr);

  if (data2Ptr) CPUPart.freeRGBA(data2Ptr);
  data2Ptr = CPUPart.allocRGBA(config.canvasWidth * config.canvasHeight);

  cvs.width = config.canvasWidth;
  cvs.height = config.canvasHeight;

  GPUPart.reset();

  frameTimes.length = 0;
}

async function iteration() {
  const t0 = performance.now();

  // 1. CPU-side processing step
  const dy = 10 * Math.sin(frameNum * 0.01);
  CPUPart.processImage(config.canvasWidth, config.canvasHeight, dy, data1Ptr, data2Ptr);
  const t1 = performance.now();

  // 2. Upload (CPU -> GPU)
  switch (config.uploadMethod) {
    case 'none':
      break;
    case 'write':
      {
        device.queue.writeBuffer(GPUPart.buffer1, 0,
          new Uint32Array(CPUPart.memory.buffer, data2Ptr, config.canvasWidth * config.canvasHeight));
      } break;
    case 'copy':
      throw new Error('unimplemented');
    case 'mmap':
      throw new Error('unimplemented (obviously)');
    default:
      throw new Error('??');
  }
  const t2 = performance.now();

  // 3. GPU-side processing step
  GPUPart.processImage(frameNum);
  const t3 = performance.now();

  // 4. Download (GPU -> CPU)
  switch (config.downloadMethod) {
    case 'none':
      break;
    case 'copy':
      throw new Error('unimplemented');
    case 'mmap':
      throw new Error('unimplemented (obviously)');
    default:
      throw new Error('??');
  }
  const t4 = performance.now();

  timing.cpuProcessing_cputime = t1 - t0;
  timing.upload_cputime = t2 - t1;
  timing.gpuProcessing_roundtrip = t3 - t2;
  timing.download_cputime = t4 - t3;
}

// hack for fast async loop
const channel = new MessageChannel();

let tLast = performance.now();
let frameNum = 0;
let frameTimes = [];
function frame() {
  for (const k of Object.keys(timing)) {
    timing[k] = 0;
  }

  if (config.pause || document.hidden) {
    frameTimes.length = 0;
    tLast = performance.now();
    requestAnimationFrame(frame);
  } else {
    iteration();
    if (config.vsync) {
      requestAnimationFrame(frame);
    } else {
      channel.port1.postMessage(0);
    }
    const now = performance.now();
    const dt = now - tLast;
    tLast = now;

    if (frameTimes.length > config.numSamplesForMean) {
      frameTimes.length = config.numSamplesForMean;
    } else if (frameTimes.length < config.numSamplesForMean) {
      frameNum = frameTimes.length;
      frameTimes.push(0);
    }
    timing.iter_time = dt;
    frameTimes[frameNum % frameTimes.length] = dt;
    timing.iter_time_mean = frameTimes.reduce((a, x) => a + x, 0) / frameTimes.length;
    timing.iter_time_samples = frameTimes.length;

    ++frameNum;
  }
}
channel.port2.onmessage = frame;

canvasHeightPane.on('change', ev => reset());
reset();
frame();
