import { createRsbuild } from '@rsbuild/core';
import { describe, expect, test } from 'vitest';
import {
  PLUGIN_REPLACE_ARCO_ICON_NAME,
  pluginReplaceArcoIcon,
} from './replace-icon';

describe(PLUGIN_REPLACE_ARCO_ICON_NAME, () => {
  test('should work', async () => {
    const rsbuild = await createRsbuild({
      rsbuildConfig: {
        plugins: [
          pluginReplaceArcoIcon({
            iconBox: '@arco-design/my-custom-icon',
          }),
        ],
      },
    });
    const config = await rsbuild.initConfigs();
    const rules = config[0].module?.rules;
    expect((rules?.[rules.length - 1] as { test: RegExp })?.test).toStrictEqual(
      /@arco-design\/web-react\/icon\/react-icon\/([^/]+)\/index\.js$/,
    );
  });
});
