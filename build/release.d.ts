/** Exported memory */
export declare const memory: WebAssembly.Memory;
/**
 * assembly/index/allocRGBA
 * @param size `usize`
 * @returns `usize`
 */
export declare function allocRGBA(size: number): number;
/**
 * assembly/index/freeRGBA
 * @param ptr `usize`
 */
export declare function freeRGBA(ptr: number): void;
/**
 * assembly/index/generateSomeData
 * @param w `u32`
 * @param h `u32`
 * @param ptr `usize`
 */
export declare function generateSomeData(w: number, h: number, ptr: number): void;
/**
 * assembly/index/fillImage
 * @param w `u32`
 * @param h `u32`
 * @param t `u32`
 * @param src `usize`
 * @param dst `usize`
 */
export declare function fillImage(w: number, h: number, t: number, src: number, dst: number): void;
