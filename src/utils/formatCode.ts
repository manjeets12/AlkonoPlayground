import prettier from 'prettier/standalone';
import parserBabel from 'prettier/plugins/babel';
import parserEstree from 'prettier/plugins/estree';
import parserTypescript from 'prettier/plugins/typescript';
import parserPostcss from 'prettier/plugins/postcss';
import parserHtml from 'prettier/plugins/html';

export async function formatCode(code: string, path: string) {
  const extension = path.split('.').pop()?.toLowerCase();

  let parser = 'babel-ts';
  let plugins: any[] = [parserBabel, parserEstree, parserTypescript];

  if (extension === 'css') {
    parser = 'css';
    plugins = [parserPostcss];
  } else if (extension === 'html') {
    parser = 'html';
    plugins = [parserHtml];
  } else if (extension === 'json') {
    parser = 'json';
    plugins = [parserBabel, parserEstree];
  } else if (extension === 'ts' || extension === 'tsx') {
    parser = 'typescript';
    plugins = [parserTypescript, parserEstree];
  } else if (extension === 'js' || extension === 'jsx') {
    parser = 'babel';
    plugins = [parserBabel, parserEstree];
  }

  try {
    return await prettier.format(code, {
      parser,
      plugins,
      semi: true,
      singleQuote: true,
      trailingComma: 'all',
      tabWidth: 2,
    });
  } catch (err) {
    console.warn('Prettier formatting failed:', err);
    return code;
  }
}

