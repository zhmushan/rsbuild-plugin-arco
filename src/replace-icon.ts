import { createRequire } from 'node:module';
import type { RsbuildPlugin } from '@rsbuild/core';

const require = createRequire(import.meta.url);

export const PLUGIN_REPLACE_ARCO_ICON_NAME = 'plugin-replace-arco-icon';

export interface PluginReplaceArcoIconOptions {
  iconBox?: string;
}

const ARCO_ICON_REGEX =
  /@arco-design\/web-react\/icon\/react-icon\/([^/]+)\/index\.js$/;

export const pluginReplaceArcoIcon = ({
  iconBox,
}: PluginReplaceArcoIconOptions): RsbuildPlugin => ({
  name: PLUGIN_REPLACE_ARCO_ICON_NAME,
  setup(api) {
    if (!iconBox) {
      return;
    }
    api.transform({ test: ARCO_ICON_REGEX }, ({ code, resourcePath }) => {
      const iconName = resourcePath.match(ARCO_ICON_REGEX)?.[1];
      const specifier = `${iconBox}/esm/${iconName}/index.js`;
      try {
        if (iconName && require.resolve(specifier)) {
          return `export { default } from "${specifier}";`;
        }
      } catch {}

      return code;
    });
  },
});
