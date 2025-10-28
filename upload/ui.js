import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import { device, ctx } from '../util.js';

const pane = new Pane();

const info = {
  vendor: device.adapterInfo.vendor,
  architecture: device.adapterInfo.architecture,
  canvas: `${ctx.canvas.width}x${ctx.canvas.height}`,
};
{
  const fInfo = pane.addFolder({ title: 'Info' });
  fInfo.addBinding(info, 'vendor', { readonly: true });
  fInfo.addBinding(info, 'architecture', { readonly: true });
  fInfo.addBinding(info, 'canvas', { readonly: true });
}

export const config = {
  pause: false,
  vsync: false,
  mode: 'writeTexture',
  interestingShader: false,
};
{
  const fConfig = pane.addFolder({ title: 'Configuration' });
  fConfig.addBinding(config, 'pause');
  fConfig.addBinding(config, 'vsync');
  fConfig.addBinding(config, 'mode', {
    options: {
      'writeTexture': 'writeTexture',
      'ring of mapped buffers': 'ring of mapped buffers',
    },
  });
  fConfig.addBinding(config, 'interestingShader');
}

export const timing = {
  total_jstime: 0,
  fillImage_jstime: 0,
  writeTexture_jstime: 0,
  render_jstime: 0,
  iteration_time: 0,
};
{
  const fTiming = pane.addFolder({ title: 'Timing' });
  fTiming.addBinding(timing, 'total_jstime', { readonly: true, view: 'graph' });
  fTiming.addBinding(timing, 'fillImage_jstime', { readonly: true, view: 'graph' });
  fTiming.addBinding(timing, 'writeTexture_jstime', { readonly: true, view: 'graph' });
  fTiming.addBinding(timing, 'render_jstime', { readonly: true, view: 'graph' });
  fTiming.addBinding(timing, 'iteration_time', { readonly: true, view: 'graph' });
}
