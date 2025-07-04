import type { Parser } from "acorn";

interface Options {
  source?: boolean;
  defer?: boolean;
}

export default function acornImportPhases(options?: Options): (BaseParser: Parser) => Parser;
