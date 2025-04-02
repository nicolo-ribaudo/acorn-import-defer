import { describe, it } from "node:test";
import { deepStrictEqual } from "node:assert";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

import * as acornESM from "acorn";
import pluginESM from "../src/index.js";

import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const acornCJS = require("acorn");
const pluginCJS = require("../src/index.cjs");

const resolve = (path) => fileURLToPath(import.meta.resolve(path));

const testFolders = readdirSync(resolve("./fixtures")).filter((file) =>
  statSync(resolve(`./fixtures/${file}`)).isDirectory()
);

const overwrite = process.env.OVERWRITE === "1";

describe("acorn-import-defer", () => {
  describe("esm", () => {
    runTests(acornESM, pluginESM);
  });

  (overwrite ? describe.skip : describe)("cjs", () => {
    runTests(acornCJS, pluginCJS);
  });
});

function runTests(acorn, plugin) {
  testFolders.forEach((folderName) => {
    it(`should parse ${folderName}`, () => {
      const actual = readFileSync(
        resolve(`./fixtures/${folderName}/actual.js`),
        "utf8"
      );
      const expectedFile = resolve(`./fixtures/${folderName}/expected.json`);

      let result;
      try {
        const Parser = acorn.Parser.extend(plugin);
        console.log(Parser)
        result = Parser.parse(actual, {
          ecmaVersion: 2024,
          locations: true,
          ranges: true,
          sourceType: "module",
        });
      } catch (e) {
        result = {
          error: e.message,
        };
      }

      let expected;

      // This lets us auto-generate test expected files easily:
      try {
        if (overwrite) throw new Error();
        expected = readFileSync(expectedFile, "utf8");
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log("No expected file found. Generating result file...");
        writeFileSync(expectedFile, JSON.stringify(result, null, "  "));
        throw new Error("Please re-run tests to compare updates.");
      }

      deepStrictEqual(
        // Convert to JSON before doing a compare:
        JSON.parse(JSON.stringify(result)),
        JSON.parse(expected)
      );
    });
  });
}
