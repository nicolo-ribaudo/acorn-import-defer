/**
 * @param {typeof import("acorn").Parser} Parser
 * @param {typeof import("acorn").tokTypes} acorn
 */
exports.plugin = function acornImportDefer(Parser, tt) {
  return class extends Parser {
    #defer = false;

    parseImport(node) {
      this.#defer = false;
      const result = super.parseImport(node);
      if (this.#defer) {
        node.phase = "defer";
      }
      return result;
    }

    parseImportSpecifiers() {
      if (!this.isContextual("defer")) return super.parseImportSpecifiers();

      const deferId = this.parseImportDefaultSpecifier();
      if (this.isContextual("from")) {
        return [deferId];
      } else if (this.eat(tt.comma)) {
        if (this.type !== tt.star && this.type !== tt.braceL) {
          this.unexpected();
        }
        const nodes = super.parseImportSpecifiers();
        nodes.unshift(deferId);
        return nodes;
      }

      this.#defer = true;

      if (this.type !== tt.star) {
        this.raiseRecoverable(
          deferId.start,
          "'import defer' can only be used with namespace imports."
        );
      }

      return super.parseImportSpecifiers();
    }

    parseExprImport(forNew) {
      const node = super.parseExprImport(forNew);

      if (node.type === "MetaProperty" && node.property.name === "defer") {
        if (this.type === tt.parenL) {
          const dynImport = this.parseDynamicImport(this.startNodeAt(node.start, node.loc.start));
          dynImport.phase = "defer";
          return dynImport;
        } else {
          this.raiseRecoverable(
            node.start,
            "'import.defer' can only be used in a dynamic import."
          );
        }
      }

      return node;
    }

    parseImportMeta(node) {
      this.next();

      var containsEsc = this.containsEsc;
      node.property = this.parseIdent(true);

      const { name } = node.property;

      if (name !== "meta" && name !== "defer") {
        this.raiseRecoverable(
          node.property.start,
          "The only valid meta property for import is 'import.meta'"
        );
      }
      if (containsEsc) {
        this.raiseRecoverable(
          node.start,
          `'import.${name}' must not contain escaped characters`
        );
      }
      if (
        name === "meta" &&
        this.options.sourceType !== "module" &&
        !this.options.allowImportExportEverywhere
      ) {
        this.raiseRecoverable(
          node.start,
          "Cannot use 'import.meta' outside a module"
        );
      }

      return this.finishNode(node, "MetaProperty");
    }
  };
};
