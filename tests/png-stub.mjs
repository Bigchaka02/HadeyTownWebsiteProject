// Node loader hook: make `import x from "./file.png"` yield the path string (like Vite does).
import { register } from "node:module";
register(
  "data:text/javascript," +
    encodeURIComponent(`
      export async function resolve(specifier, context, next) {
        if (specifier.endsWith(".png")) return { url: "png:" + specifier, shortCircuit: true };
        return next(specifier, context);
      }
      export async function load(url, context, next) {
        if (url.startsWith("png:")) return { format: "module", source: "export default " + JSON.stringify(url.slice(4)) + ";", shortCircuit: true };
        return next(url, context);
      }
    `),
);
