/** Allocate RGBA8 image in Wasm memory. */
export function allocRGBA(size: usize): usize {
  return heap.alloc(size * 4);
}

/** Fill an array at a given raw pointer to Wasm memory with some image data. */
export function fillImage(w: i32, h: i32, ptr: usize): void {
  assert(ptr !== 0, 'ptr is null');
  for (let y = 0; y < h; ++y) {
    for (let x = 0; x < w; ++x) {
      store<u32>(ptr + (y * w + x) * 4, 1);
    }
  }
}
