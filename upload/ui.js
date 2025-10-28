import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import { device, ctx } from '../util.js';

const pane = new Pane({ container: panediv });

{
  const info = {
    vendor: device.adapterInfo.vendor,
    architecture: device.adapterInfo.architecture,
    canvas: `${ctx.canvas.width}x${ctx.canvas.height}`,
  };
  const fInfo = pane.addFolder({ title: 'Info' });
  fInfo.addBinding(info, 'vendor', { readonly: true });
  fInfo.addBinding(info, 'architecture', { readonly: true });
  fInfo.addBinding(info, 'canvas', { readonly: true });
}

export const config = {
  mode: 'writeTexture',
  gpuShading: true,
};
{
  const fConfig = pane.addFolder({ title: 'Configuration' });
  fConfig.addBinding(config, 'mode', {
    options: {
      'writeTexture': 'writeTexture',
    },
  });
  fConfig.addBinding(config, 'gpuShading');
}
