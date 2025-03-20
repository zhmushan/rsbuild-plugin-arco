// MIT https://github.com/arco-design/arco-plugins/blob/9c5998a6abbbed1e364788931d239adbf16136a6

import fs from 'node:fs';
import path from 'node:path';

// #region utils/theme.ts
// https://github.com/arco-design/arco-plugins/blob/9c5998a6abbbed1e364788931d239adbf16136a6/packages/unplugin-react/src/utils/theme.ts#L5-L60

function getPackageRootDir(theme: string) {
  return path.dirname(
    require.resolve(`${theme}/package.json`, {
      paths: [process.cwd()],
    }),
  );
}

export function getThemeComponents(theme: string): string[] {
  try {
    const themeComponentDirPath = `${getPackageRootDir(theme)}/components`;
    const ret = fs.readdirSync(themeComponentDirPath);
    return ret || [];
  } catch {
    return [];
  }
}

/**
 * @see https://github.com/arco-design/arco-plugins/blob/c25c55a0a9fe195e1a632a1fa0f63a1bd452df3d/packages/plugin-webpack-react/src/arco-design-plugin/plugin-for-theme.ts#L165-L195
 */
function transformSourceToObject(source = '') {
  // 去掉注释
  const str = source
    .replace(/\/\/.*/g, '') // ‘//’ 之后的所有内容（以一行为结束）
    .replace(/\/\*[\s\S]*?\*\//g, ''); // ‘/**/’ 之间的所有内容
  if (!str) {
    return;
  }
  const cssVarsPrefix = undefined; // this.options.modifyVars?.['arco-cssvars-prefix'];
  const obj: Record<string, string> = {};
  // biome-ignore lint: _
  str
    .match(/(?=@)([\s\S]+?)(?=;)/g) // 匹配变量定义，结果为 ‘@变量名: 变量值’
    // biome-ignore lint: _
    ?.map((item) => item && item.split(':'))
    .filter((item) => item && item.length === 2)
    .forEach((item) => {
      const key = item[0].replace(/^@/, '').trim();
      let value = item[1].trim();
      if (key && value) {
        if (cssVarsPrefix && value.includes('--')) {
          value = value.replace('--', `${cssVarsPrefix}-`);
        }
        obj[key] = value;
      }
    });

  return obj;
}

export function getThemeTokens(theme: string): Record<string, string> {
  try {
    return (
      transformSourceToObject(
        fs.readFileSync(`${getPackageRootDir(theme)}/tokens.less`, 'utf8'),
      ) || {}
    );
  } catch {
    return {};
  }
}

// #endregion

// #region loaders/append.ts
// https://github.com/arco-design/arco-plugins/blob/9c5998a6abbbed1e364788931d239adbf16136a6/packages/unplugin-react/src/loaders/append.ts#L9-L36

export function matchGlobalStyle(resourcePath: string) {
  const match = resourcePath.match(
    /[\\/](es|lib)[\\/]style[\\/]index.(css|less)$/,
  );
  if (!match) {
    return null;
  }
  return {
    module: match[1],
    type: match[2],
  };
}

export function matchComponentStyle(resourcePath: string) {
  const match = resourcePath.match(
    /[\\/](es|lib)[\\/](\w+)[\\/]style[\\/]index.(css|less)$/,
  );
  if (!match) {
    return null;
  }
  return {
    module: match[1],
    name: match[2],
    type: match[3],
  };
}

export function getFileSource(path: string) {
  const absolutePath = require.resolve(path);
  return new Promise<string>((resolve, reject) => {
    fs.readFile(absolutePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// #endregion
