import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import { device, ctx } from '../util.js';

const pane = new Pane();

const info = {
  vendor: device.adapterInfo.vendor,
  architecture: device.adapterInfo.architecture,
};
const fInfo = pane.addFolder({ title: 'Info' });
fInfo.addBinding(info, 'vendor', { readonly: true });
fInfo.addBinding(info, 'architecture', { readonly: true });

export const config = {
  pause: false,
  vsync: false,
  canvasHeight: 2048,
  mode: 'writeTexture',
  interestingShader: false,
  averagingWindow: 200,
};
const fConfig = pane.addFolder({ title: 'Configuration' });
fConfig.addBinding(config, 'pause');
fConfig.addBinding(config, 'vsync');
export const canvasHeightPane = fConfig.addBinding(config, 'canvasHeight', { min: 1, max: 4096, step: 1 });
fConfig.addBinding(config, 'mode', {
  options: {
    'writeTexture': 'writeTexture',
    'ring of mapped buffers': 'ring of mapped buffers',
  },
});
fConfig.addBinding(config, 'interestingShader');
fConfig.addBinding(config, 'averagingWindow', { min: 1, max: 1000, step: 1 });

export const timing = {
  total_cputime: 0,
  fillImage_cputime: 0,
  writeTexture_cputime: 0,
  render_cputime: 0,
  iter_time: 0,
  iter_time_mean: 0,
  iter_time_samples: 0,
};
const fTiming = pane.addFolder({ title: 'Timing' });
fTiming.addBinding(timing, 'total_cputime', { readonly: true, view: 'graph' });
fTiming.addBinding(timing, 'fillImage_cputime', { readonly: true, view: 'graph' });
fTiming.addBinding(timing, 'writeTexture_cputime', { readonly: true, view: 'graph' });
fTiming.addBinding(timing, 'render_cputime', { readonly: true, view: 'graph' });
fTiming.addBlade({ view: 'separator' });
fTiming.addBinding(timing, 'iter_time', { readonly: true, view: 'graph' });
fTiming.addBinding(timing, 'iter_time_mean', { readonly: true, format: v => v.toFixed(6) });
fTiming.addBinding(timing, 'iter_time_samples', { readonly: true, format: v => v.toFixed(0) });
