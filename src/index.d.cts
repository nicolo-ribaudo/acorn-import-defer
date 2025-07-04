import type { Parser } from "acorn";

interface Options {
  source?: boolean;
  defer?: boolean;
}

declare function acornImportPhases(options?: Options): (BaseParser: Parser) => Parser;
export = acornImportPhases;