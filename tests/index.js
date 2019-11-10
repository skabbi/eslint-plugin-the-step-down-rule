const fs = require("fs");
const RuleTester = require("eslint").RuleTester;

const rule = require("../lib/rules/the-step-down-rule");

const errMsg = "Does not follow a top-down call structure";

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
  }
});

ruleTester.run("the-step-down-rule", rule, {
  valid: [
    { code: fs.readFileSync("./lib/rules/the-step-down-rule.js", "utf8") },
    {
      code: `
        const a = require('aaa');

        function b() {
          a();
        }
      `,
    },
    {
      code: `
        const { a } = require('a');

        function b() {
          a();
        }
      `,
    },
    {
      code: `
        import a from 'a';

        function b() {
          a();
        }
      `,
    },
    {
      code: `
        function a() {
          b();
        }

        function b() {}
      `,
    },
    {
      code: `
        const a = () => {
          b();
        }

        const b = () => {}
      `,
    },
    {
      code: `
        function a() {
          b();
        }

        const b = () => {}
      `,
    },
    {
      code: `
        const a = () => {
          b();
        }

        function b() {}
      `,
    },
    {
      code: `
        const a = () => {
          a();
        }
      `,
    },
    {
      code: `
        function a() {
          a();
        }
      `,
    },
    {
      code: `
        const str = "";

        function a() {
          b(str);
        }

        function b(x) {}
      `,
    },
    {
      code: `
        const str = "";

        function a() {
          b(str);
        }

        function b(x) {
          c(x);
        }

        function c(x) {}
      `,
    },
    {
      code: `
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
      `,
    },
    {
      code: `        
        function a() {
          b();
        }

        function c() {
          b();
          d();
        }

        function b() {
          e();
        }

        function e() {}

        function d() {}

        a();
        c();
      `,
    },
  ],

  invalid: [
    {
      code: `
        function b() {}

        function a() {
          b();
        }
      `,
      errors: [{ message: `'b' ${errMsg}` }]
    },
    {
      code: `
        a();

        function a() {
          b();
        }

        function b() {}

        const c = () => {
          b();
        }
      `,
      errors: [
        { message: `'a' ${errMsg}` },
        { message: `'b' ${errMsg}` }
      ]
    },
    {
      code: `   
        a();
        c();

        function a() {
          b();
        }

        function c() {
          b();
          d();
        }

        function e() {}

        function b() {
          e();
        }

        function d() {}
      `,
      errors: [
        { message: `'a' ${errMsg}` },
        { message: `'c' ${errMsg}` },
        { message: `'e' ${errMsg}` },
      ]
    }
  ]
});