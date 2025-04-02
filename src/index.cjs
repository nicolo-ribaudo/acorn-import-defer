const { plugin } = require("./plugin.cjs");

module.exports = function (Parser) {
  return plugin(Parser, (Parser.acorn || require("acorn")).tokTypes);
};
