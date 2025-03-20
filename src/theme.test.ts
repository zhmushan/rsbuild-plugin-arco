import { createRsbuild } from '@rsbuild/core';
import { pluginLess } from '@rsbuild/plugin-less';
import { describe, expect, it } from 'vitest';
import { PLUGIN_ARCO_THEME_NAME, pluginArcoTheme } from './theme';

describe(PLUGIN_ARCO_THEME_NAME, () => {
  it('should throw error when no less plugin', async () => {
    const rsbuild = await createRsbuild({
      rsbuildConfig: {
        plugins: [pluginArcoTheme({ theme: '@arco-design/my-custom-theme' })],
      },
    });
    await expect(rsbuild.initConfigs()).rejects.toThrowError();
  });

  it('should throw error when no theme', async () => {
    const rsbuild = await createRsbuild({
      rsbuildConfig: {
        plugins: [pluginArcoTheme({ theme: '' }), pluginLess()],
      },
    });
    await expect(rsbuild.initConfigs()).rejects.toThrowError();
  });
});
