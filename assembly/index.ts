/** Allocate RGBA8 image in Wasm memory. */
export function allocRGBA(size: usize): usize {
  return heap.alloc(size * 4);
}

export function freeRGBA(ptr: usize): void {
  heap.free(ptr);
}

function pixel(x: u32, y: u32): u32 {
  return 0xff000000 | ((x / 2 - y / 32) ^ (y * 2));
}

/** Fill an array at a given raw pointer to Wasm memory with some image data. */
export function generateSomeData(w: u32, h: u32, ptr: usize): void {
  assert(ptr !== 0, "ptr is null");
  for (let y: u32 = 0; y < h; ++y) {
    for (let x: u32 = 0; x < w; ++x) {
      store<u32>(ptr + (y * w + x) * 4, pixel(x, y));
    }
  }
}

/** Very fast way of filling an image with different data each frame. */
export function fillImage(
  w: u32,
  h: u32,
  t: u32,
  src: usize,
  dst: usize
): void {
  assert(src !== 0, "src is null");
  assert(dst !== 0, "dst is null");
  const size = w * h * 4;
  const split = (t % h) * w * 4;
  memory.copy(dst + size - split, src, split);
  memory.copy(dst + 0, src + split, size - split);
}
