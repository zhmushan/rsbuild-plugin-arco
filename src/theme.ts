import type { RsbuildPlugin } from '@rsbuild/core';
import type { LessLoaderOptions } from '@rsbuild/plugin-less';
import {
  getFileSource,
  getThemeComponents,
  getThemeTokens,
  matchComponentStyle,
  matchGlobalStyle,
} from './utils';

const PLUGIN_LESS_NAME = 'rsbuild:less';

export const PLUGIN_ARCO_THEME_NAME = 'plugin-arco-theme';

export interface PluginArcoThemeOptions {
  theme?: string;
  disableRewriteLessOptions?: boolean;
}

const ARCO_STYLE_REGEX =
  /@arco-design\/web-react\/(es|lib)(\/.*)?\/style\/index\.(css|less)$/;

let themeTokens: Record<string, string>;
const prefixThemeTokensCache = new Map<
  string | undefined,
  Record<string, string>
>();
export function getLessModifyVars(
  theme: string,
  options: Record<string, string> = {},
) {
  if (!themeTokens) {
    themeTokens = getThemeTokens(theme);
    prefixThemeTokensCache.set(undefined, themeTokens);
  }

  const prefix = options['arco-cssvars-prefix'];

  if (prefix && !prefixThemeTokensCache.has(prefix)) {
    prefixThemeTokensCache.set(
      prefix,
      Object.fromEntries(
        Object.entries(themeTokens).map(([key, value]) => [
          key,
          value.includes('--') ? value.replace('--', `${prefix}-`) : value,
        ]),
      ),
    );
  }

  return {
    ...prefixThemeTokensCache.get(prefix),
    ...options,
  };
}

export const pluginArcoTheme = ({
  theme,
  disableRewriteLessOptions,
}: PluginArcoThemeOptions): RsbuildPlugin => ({
  name: PLUGIN_ARCO_THEME_NAME,
  pre: [PLUGIN_LESS_NAME],
  setup(api) {
    if (!theme) {
      throw new Error('theme is required');
    }
    if (!api.isPluginExists(PLUGIN_LESS_NAME)) {
      throw new Error(
        `${PLUGIN_ARCO_THEME_NAME} requires ${PLUGIN_LESS_NAME} to be used, please add ${PLUGIN_LESS_NAME} to your config`,
      );
    }
    const components = new Set(getThemeComponents(theme));
    api.transform({ test: ARCO_STYLE_REGEX }, ({ code, resourcePath }) => {
      const matchGlobal = matchGlobalStyle(resourcePath);
      if (matchGlobal) {
        const themeResource = `${theme}/theme.${matchGlobal.type}`;
        if (matchGlobal.type === 'css') {
          return getFileSource(themeResource)
            .then((themeContent) => `${code}\n${themeContent}`)
            .catch(() => code);
        }
        return `${code}\n@import '~${themeResource}';`;
      }

      const matchComponent = matchComponentStyle(resourcePath);
      if (matchComponent && components.has(matchComponent.name)) {
        const themeResource = `${theme}/components/${matchComponent.name}/index.${matchComponent.type}`;
        if (matchComponent.type === 'css') {
          return getFileSource(themeResource)
            .then((themeContent) => `${code}\n${themeContent}`)
            .catch(() => code);
        }

        return [
          code,
          `@import '~${theme}/theme.less';`,
          `@import '~${theme}/tokens.less';`,
          `@import '~${themeResource}';`,
        ].join('\n');
      }

      return code;
    });

    if (disableRewriteLessOptions) {
      return;
    }

    api.modifyBundlerChain((chain, { CHAIN_ID }) => {
      for (const rule of chain.module.rules.values()) {
        const lessLoader = (rule as unknown as (typeof rule)[number]).uses.get(
          CHAIN_ID.USE.LESS,
        );
        if (!lessLoader) {
          continue;
        }
        lessLoader.tap((options: LessLoaderOptions = {}) => {
          if (!options.lessOptions) {
            options.lessOptions = {};
          }

          options.lessOptions.modifyVars = getLessModifyVars(
            theme,
            options.lessOptions.modifyVars,
          );
          return options;
        });
      }
    });
  },
});
