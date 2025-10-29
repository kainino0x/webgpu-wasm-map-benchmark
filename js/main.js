import { canvasHeightPane, config, timing } from './ui.js';
import { device, yieldUnthrottled } from './util.js';
import { CPUPart } from './cpupart.js';
import { GPUPart } from './gpupart.js';

async function iteration() {
  const t0 = performance.now();

  // 1. CPU-side processing step (CPU data1 -> CPU data2)
  CPUPart.processImage(frameNum);
  const t1 = performance.now();

  // 2. Upload (CPU 2 -> GPU 1)
  switch (config.uploadMethod) {
    case 'none':
      {
        // If not uploading data to GPU, just swap the two GPU buffers.
        GPUPart.swap();
      } break;
    case 'write':
      {
        device.queue.writeBuffer(GPUPart.buffer1, 0, CPUPart.data2View);
      } break;
    case 'copy':
      throw new Error('unimplemented');
    case 'mmap':
      throw new Error('unimplemented (obviously)');
    default:
      throw new Error('??');
  }
  const t2 = performance.now();

  // 3. GPU-side processing step (GPU data1 -> GPU data2)
  //    (The output of this step is what's visible.)
  GPUPart.readbackBuffer.unmap();
  GPUPart.processImage(frameNum);
  await GPUPart.readbackBuffer.mapAsync(GPUMapMode.READ);
  const t3 = performance.now();

  // 4. Download (GPU data2 -> CPU data1)
  switch (config.downloadMethod) {
    case 'none':
      {
        // If not downloading data to CPU, just swap the two CPU buffers.
        CPUPart.swap();
      } break;
    case 'copy':
      {
        CPUPart.data1View.set(GPUPart.readbackBuffer.getMappedRange());
      } break;
    case 'mmap':
      throw new Error('unimplemented (obviously)');
    default:
      throw new Error('??');
  }
  const t4 = performance.now();

  timing.cpuProcessing_cpuTime = t1 - t0;
  timing.upload_cpuTime = t2 - t1;
  timing.gpuProcessing_rtTime = t3 - t2;
  timing.download_cpuTime = t4 - t3;
}

let tLast = performance.now();
let frameNum = 0;
let frameTimes = [];

function reset() {
  CPUPart.reset();
  GPUPart.reset();
  frameTimes.length = 0;
}
canvasHeightPane.on('change', ev => reset());
reset();

// Async main loop
while (true) {
  if (config.pause || document.hidden) {
    for (const k of Object.keys(timing)) {
      timing[k] = 0;
    }
    frameTimes.length = 0;
    tLast = performance.now();
    await new Promise(requestAnimationFrame);
  } else {
    await iteration();

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
