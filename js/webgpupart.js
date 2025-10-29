import { config } from './ui.js';
import { device, ctx } from './util.js';

ctx.configure({ device, format: 'rgba8unorm' });

const ubo = device.createBuffer({
  size: 8,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
});

const bgl = device.createBindGroupLayout({
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: {},
    },
    {
      binding: 1,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: { type: 'storage' },
    },
    {
      binding: 2,
      visibility: GPUShaderStage.FRAGMENT,
      buffer: { type: 'storage' },
    },
  ],
});
const pll = device.createPipelineLayout({ bindGroupLayouts: [bgl] });

const shaderModule = device.createShaderModule({
  code: `
    struct Config {
      w: u32,
      dx: u32,
    }
    @group(0) @binding(0) var<uniform> config: Config;
    @group(0) @binding(1) var<storage, read_write> src: array<u32>;
    @group(0) @binding(2) var<storage, read_write> dst: array<u32>;

    @vertex
    fn fullscreen_quad(@builtin(vertex_index) vi: u32) -> @builtin(position) vec4f {
      const pos = array(
        vec2(-1.0, -1.0), vec2(1.0, -1.0), vec2(-1.0, 1.0),
        vec2(-1.0, 1.0), vec2(1.0, -1.0), vec2(1.0, 1.0),
      );

      return vec4f(pos[vi], 0.0, 1.0);
    }

    @fragment
    fn fmain(@builtin(position) coord: vec4f) -> @location(0) vec4f {
      let pSrc = vec2u(coord.xy);
      let pDst = vec2u((pSrc.x + config.dx) % config.w, pSrc.y);

      let v = src[pSrc.y * config.w + pSrc.x];
      dst[pDst.y * config.w + pDst.y] = v;

      return unpack4x8unorm(v);
    }
  `,
});

const pipeline = device.createRenderPipeline({
  layout: pll,
  vertex: { module: shaderModule },
  fragment: {
    module: shaderModule,
    targets: [{ format: 'rgba8unorm' }],
  },
  primitive: { topology: 'triangle-list', },
});

let buffer1, buffer2, bg;

export const GPUPart = {
  get buffer1() { return buffer1; },
  get buffer2() { return buffer2; },

  reset() {
    if (buffer1) buffer.destroy();
    buffer1 = device.createBuffer({
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
      size: config.canvasWidth * config.canvasHeight * 4,
    });

    if (buffer2) buffer.destroy();
    buffer2 = device.createBuffer({
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
      size: config.canvasWidth * config.canvasHeight * 4,
    });

    bg = device.createBindGroup({
      layout: bgl,
      entries: [
        { binding: 0, resource: ubo },
        { binding: 1, resource: buffer1 },
        { binding: 2, resource: buffer2 },
      ],
    });
  },

  processImage(frameNum) {
    const dx = 40 * Math.sin(frameNum * 0.05);
    device.queue.writeBuffer(ubo, 0, new Uint32Array([config.canvasWidth, dx]));
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
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bg);
      pass.draw(6);
      pass.end();
    }
    device.queue.submit([encoder.finish()]);
  },
};
