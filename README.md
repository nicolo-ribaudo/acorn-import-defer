# Support for `import defer` in acorn

## Install

```
npm install acorn-import-defer
```

## Usage

This module provides a plugin that can be used to extend the Acorn Parser class:

```js
const {Parser} = require('acorn');
const importDefer = require('acorn-import-defer');
Parser.extend(importDefer).parse('...');
```

## License

This plugin is released under an MIT License.
