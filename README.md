# eslint-plugin-the-step-down-rule

Enforces that functions follow a top-down call structure when calling a lower-level function.

This is basically just the opposite of the `no-use-before-define` rule, except it only applies to functions that are called outside the scope they are defined in.

## Examples

The rule applies to top-level function calls and to `this.method()` / `this.#privateMethod()` calls inside classes.

### Functions

##### Good
```js
const a = require('a');

function b() {
  a();
  d();
}

function c() {
  d();
}

const d = () => {};

b();
```

##### Bad
```js
a();

function a() {
  b();
}

const b = () => {};

function c() {
  b();
}
```

### Class Methods

##### Good
```js
class ExampleClass {
  publicMethod() {
    this.#midLevelMethod();
  }

  #midLevelMethod() {
    this.#lowLevelMethod();
  }

  #lowLevelMethod() {}
}
```

##### Bad
```js
class ExampleClass {
  #midLevelMethod() {
    this.#lowLevelMethod();
  }

  publicMethod() {
    this.#midLevelMethod();
  }

  #lowLevelMethod() {}
}
```

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-the-step-down-rule`:

```
$ npm install eslint-plugin-the-step-down-rule --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-the-step-down-rule` globally.

## Usage

Add `the-step-down-rule` to your `eslint.config.js` configuration file.
```js
// eslint.config.js
import { defineConfig } from "eslint/config";
import theStepDownRule from "eslint-plugin-the-step-down-rule";

export default defineConfig([
  {
    plugins: {
      "the-step-down-rule": theStepDownRule,
    },
    rules: {
      "the-step-down-rule/the-step-down-rule": "warn",
    },
  },
]);
```

Use `"warn"` or `"error"` depending on how strict you want the rule to be.

## Additional Rules

Depending on your setup, you might need to disable the `no-use-before-define` rule.
```js
"no-use-before-define": ["error", { "variables": false, "functions": false }]
```
