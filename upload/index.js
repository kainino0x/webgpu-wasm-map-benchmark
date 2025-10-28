import { config } from './ui.js';
import { device, ctx } from '../util.js';
import * as Module from '../build/debug.js'; // FIXME

/** Allocate RGBA8 image in Wasm memory and view it as a Uint32Array. */
function allocWasmImage(width, height) {
    const numPixels = width * height;
    const ptr = Module.allocRGBA(numPixels);
    return new Uint32Array(Module.memory.buffer, ptr, numPixels);
}

const w = 1920, h = 1080;
const data = allocWasmImage(w, h);
Module.fillImage(w, h, data.byteOffset);
console.log(data);
