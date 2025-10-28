const GL_COLOR_BUFFER_BIT = 0x00004000;

@external("../clearCalls.js", "clearThruJS")
declare function clearThruJS(gl: externref, mask: i32): void;

@external("../clearCalls.js", "clearNoJS")
declare function clearNoJS(gl: externref, mask: i32): void;


export function clearManyTimesThruJS(gl: externref, count: i32): void {
  for (let i = 0; i < count; ++i) {
    clearThruJS(gl, GL_COLOR_BUFFER_BIT);
  }
}

export function clearManyTimesNoJS(gl: externref, count: i32): void {
  for (let i = 0; i < count; ++i) {
    clearNoJS(gl, GL_COLOR_BUFFER_BIT);
  }
}
