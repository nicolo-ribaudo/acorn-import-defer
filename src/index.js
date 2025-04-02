import { tokTypes } from "acorn";
import { plugin } from "./plugin.cjs";

export default function (Parser) {
  return plugin(Parser, Parser.acorn ? Parser.acorn.tokTypes : tokTypes);
}
