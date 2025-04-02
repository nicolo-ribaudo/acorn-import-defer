// Test for old Node.js versions, to check that the plugin does not crash

const assert = require("assert");
const acorn = require("acorn");
const plugin = require("../src/index.cjs");

const Parser = acorn.Parser.extend(plugin);

const result = Parser.parse("import defer * as foo from 'foo'", {
  ecmaVersion: 2024,
  locations: true,
  ranges: true,
  sourceType: "module",
});

assert.strictEqual(result.body[0].phase, 'defer');
