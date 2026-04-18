import fs from "node:fs";
import path from "node:path";

const pkgPath = path.join("dist", "omega-angular", "package.json");
const json = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
json.exports = {
  ...json.exports,
  "./eslint-plugin/index.cjs": "./eslint-plugin/index.cjs",
  "./eslint/config-omega.mjs": "./eslint/config-omega.mjs",
};
fs.writeFileSync(pkgPath, JSON.stringify(json, null, 2) + "\n");
