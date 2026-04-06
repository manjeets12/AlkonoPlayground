import prettier from "prettier/standalone";
import parserBabel from "prettier/plugins/babel";
import parserEstree from "prettier/plugins/estree";

export async function formatCode(code: string) {
  try {
    return await prettier.format(code, {
      parser: "babel-ts",
      plugins: [parserBabel, parserEstree],
      semi: true,
      singleQuote: true,
    });
  } catch (err) {
    console.error(err);
    return code;
  }
}
