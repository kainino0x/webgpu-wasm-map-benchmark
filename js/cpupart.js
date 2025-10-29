import { config } from './ui.js';
import * as Module from '../build/release.js';

let data1Ptr, data2Ptr;
let data1View, data2View;
export const CPUPart = {
  get data1View() { return data1View; },
  get data2View() { return data2View; },

  reset() {
    const size = config.canvasWidth * config.canvasHeight;
    if (data1Ptr) Module.freeRGBA(data1Ptr);
    data1Ptr = Module.allocRGBA(size);
    Module.generateSomeData(config.canvasWidth, config.canvasHeight, data1Ptr);

    if (data2Ptr) Module.freeRGBA(data2Ptr);
    data2Ptr = Module.allocRGBA(size);

    // Now that memory is allocated it's safe to take a reference to
    // Module.memory.buffer as it won't get resized.
    data1View = new Uint32Array(Module.memory.buffer, data1Ptr, size);
    data2View = new Uint32Array(Module.memory.buffer, data2Ptr, size);
  },

  processImage(frameNum) {
    const dy = 10 * Math.sin(frameNum * 0.01);
    Module.processImage(config.canvasWidth, config.canvasHeight, dy, data1Ptr, data2Ptr);
  },
};
