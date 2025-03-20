# Arco 插件

## 安装插件

```bash
pnpm add rsbuild-plugin-arco -D
```

## 注册插件

> 注意：`pluginArcoTheme` 必须与 `pluginLess` 一起使用

```ts
import { defineConfig } from "@rsbuild/core";
import { pluginLess } from "@rsbuild/plugin-less";
import { pluginReplaceArcoIcon, pluginArcoTheme } from "rsbuild-plugin-arco";

export default defineConfig({
  plugins: [
    pluginReplaceArcoIcon({
      iconBox: "your-custom-icon-box",
    }),
    pluginArcoTheme({
      theme: "your-custom-arco-theme",
    }),
    pluginLess({
      lessLoaderOptions: {
        lessOptions: {
          modifyVars: {
            "arco-cssvars-prefix": "--your-custom-prefix",
          },
        },
      },
    }),
  ],
});
```

## 自定义 Less 影响范围

```ts
import { defineConfig } from "@rsbuild/core";
import { pluginLess } from "@rsbuild/plugin-less";
import {
  pluginReplaceArcoIcon,
  pluginArcoTheme,
  getLessModifyVars,
} from "rsbuild-plugin-arco";

export default defineConfig({
  plugins: [
    pluginReplaceArcoIcon({
      iconBox: "your-custom-icon-box",
    }),
    pluginArcoTheme({
      theme: "your-custom-arco-theme",
      disableRewriteLessOptions: true,
    }),
    pluginLess({
      exclude: /@arco-design\/web-react\/.*\.less$/,
    }),
    pluginLess({
      lessLoaderOptions: {
        lessOptions: {
          modifyVars: getLessModifyVars("@arco-design/theme-ve-o-design", {
            "arco-cssvars-prefix": "--custom-arco-prefix",
          }),
        },
      },
      include: /@arco-design\/web-react\/.*\.less$/,
    }),
  ],
});
```
