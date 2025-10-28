/** Exported memory */
export declare const memory: WebAssembly.Memory;
/**
 * assembly/index/allocRGBA
 * @param size `usize`
 * @returns `usize`
 */
export declare function allocRGBA(size: number): number;
/**
 * assembly/index/fillImage
 * @param w `i32`
 * @param h `i32`
 * @param ptr `usize`
 */
export declare function fillImage(w: number, h: number, ptr: number): void;
