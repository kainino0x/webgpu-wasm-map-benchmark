import { config, timing } from './ui.js';
import { device, ctx } from '../util.js';
import * as Module from '../build/debug.js'; // FIXME

/** Allocate RGBA8 image in Wasm memory and view it as a Uint32Array. */
function allocWasmImage(width, height) {
  const numPixels = width * height;
  const ptr = Module.allocRGBA(numPixels);
  return new Uint32Array(Module.memory.buffer, ptr, numPixels);
}

const w = 1920, h = 1080;
const srcData = allocWasmImage(w, h);
Module.generateSomeData(w, h, srcData.byteOffset);

const dstData = allocWasmImage(w, h);

ctx.configure({ device, format: 'rgba8unorm' });

const texture = device.createTexture({
  usage: GPUTextureUsage.COPY_DST | GPUTextureUsage.TEXTURE_BINDING,
  size: [w, h],
  format: 'rgba8unorm',
});

const bgl = device.createBindGroupLayout({
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.FRAGMENT,
      texture: { sampleType: 'unfilterable-float' },
    }
  ],
});
const pll = device.createPipelineLayout({ bindGroupLayouts: [bgl] });
const bg = device.createBindGroup({
  layout: bgl,
  entries: [{ binding: 0, resource: texture.createView() }],
});

const shaderModule = device.createShaderModule({
  code: `
    @group(0) @binding(0) var tex: texture_2d<f32>;

    @vertex
    fn fullscreen_quad(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
      const pos = array(
        vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0),
        vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0),
      );

      return vec4f(pos[vi], 0.0, 1.0);
    }

    @fragment
    fn fmain_passthrough(@builtin(position) coord: vec4f) -> @location(0) vec4f {
      return textureLoad(tex, vec2<u32>(coord.xy), 0);
    }

    @fragment
    fn fmain_interesting(@builtin(position) coord: vec4f) -> @location(0) vec4f {
      let c = textureLoad(tex, vec2<u32>(coord.xy), 0);
      return vec4f(dpdx(c.x) + dpdy(c.x), 0, 0, 1);
    }
  `,
});

const plPassthrough = device.createRenderPipeline({
  layout: pll,
  vertex: { module: shaderModule },
  fragment: {
    module: shaderModule,
    entryPoint: 'fmain_passthrough',
    targets: [{ format: 'rgba8unorm' }],
  },
  primitive: { topology: 'triangle-list', },
});
const plInteresting = device.createRenderPipeline({
  layout: pll,
  vertex: { module: shaderModule },
  fragment: {
    module: shaderModule,
    entryPoint: 'fmain_interesting',
    targets: [{ format: 'rgba8unorm' }],
  },
  primitive: { topology: 'triangle-list', },
});

function render() {
  const encoder = device.createCommandEncoder();
  {
    const pass = encoder.beginRenderPass({
      colorAttachments: [
        {
          view: ctx.getCurrentTexture().createView(),
          clearValue: [0, 0, 0, 1],
          loadOp: 'clear',
          storeOp: 'store',
        },
      ],
    });
    pass.setPipeline(config.interestingShader ? plInteresting : plPassthrough);
    pass.setBindGroup(0, bg);
    pass.draw(6);
    pass.end();
  }
  device.queue.submit([encoder.finish()]);
}

function iteration(frameNum) {
  const t0 = performance.now();
  if (config.mode === 'writeTexture') {
    Module.fillImage(w, h, frameNum, srcData.byteOffset, dstData.byteOffset);
    const t1 = performance.now();
    device.queue.writeTexture({ texture }, dstData, { bytesPerRow: w * 4 }, [w, h]);
    const t2 = performance.now();
    render();
    const t3 = performance.now();
    timing.fillImage_jstime = t1 - t0;
    timing.writeTexture_jstime = t2 - t1;
    timing.render_jstime = t3 - t2;
  } else if (config.mode === 'ring of mapped buffers') {
    throw new Error('unimplemented');
  } else {
    throw new Error();
  }
  timing.total_jstime = performance.now() - t0;
}

// hack for fast async loop
const channel = new MessageChannel();

let tLast;
let frameNum = 0;
function frame() {
  for (const k of Object.keys(timing)) {
    timing[k] = 0;
  }

  const t0 = performance.now();
  if (config.pause || document.hidden) {
    requestAnimationFrame(frame);
  } else {
    iteration(frameNum++);
    if (config.vsync) {
      requestAnimationFrame(frame);
    } else {
      channel.port1.postMessage(0);
    }
  }
  const now = performance.now();

  timing.iteration_time = now - tLast;
  tLast = now;
}
channel.port2.onmessage = frame;
frame();
