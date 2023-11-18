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
    {
      code: `
        function highLevelFunction() {
            midLevelFunction();
        }
        
        function midLevelFunction() {
            lowLevelFunction();
        }
        
        function lowLevelFunction() {
            // implementation
        }
      `,
    },
    {
      code: `
        // Functions with no calls
        function independentFunctionOne() {
            // implementation
        }
        
        function independentFunctionTwo() {
            // implementation
        }
      `,
    },
    {
      code: `
        // Recursive function
        function recursiveFunction() {
            if (condition) {
                recursiveFunction();
            }
        }
      `,
    },
    {
      code: `
        // External function calls
        function highLevelFunction() {
            externalFunction();
        }
      `,
    },
    {
      code: `
        // Nested functions
        function outerFunction() {
          function innerFunction() {
              // implementation
          }
          innerFunction();
        }
      `,
    },
    {
      code: `
        class ExampleClass {
          highLevelMethod() {
              this.midLevelMethod();
          }

          midLevelMethod() {
              this.lowLevelMethod();
          }

          lowLevelMethod() {
              // Implementation details
          }
      }
      `,
    },
    {
      code: `
        class RecursiveClass {
          startProcess() {
              this.processStep(5);
          }

          processStep(steps) {
              if (steps > 0) {
                  this.processStep(steps - 1);
              }
          }
      }
      `,
    },
    {
      code: `
        class StaticInstanceClass {
          static staticMethod() {
              // Static method implementation
          }

          instanceMethod() {
              StaticInstanceClass.staticMethod();
          }
        }
      `,
    },
    {
      code: `
        class StaticInstanceClass {
          static staticMethod1() {
              // Static method implementation
          }
          static staticMethod2() {
            // Static method implementation
          }

          instanceMethod1() {
              StaticInstanceClass.staticMethod1();
          }
          instanceMethod2() {
            StaticInstanceClass.staticMethod2();
          }
        }
      `,
    },
    {
      code: `
        class MixedMethodClass {
          instanceMethod() {
              MixedMethodClass.staticMethod();
          }

          static staticMethod() {
              // Some implementation
          }
        }
      `,
    },
    {
      code: `
        class MixedMethodClass {
          static staticMethod() {
              const instance = new MixedMethodClass();
              instance.instanceMethod();
          }

          instanceMethod() {
              // Some implementation
          }
      }
      `,
    },
    {
      code: `
        class InterleavedMethodClass {
          static firstStaticMethod() {
              // Some implementation
          }

          instanceMethod() {
              InterleavedMethodClass.secondStaticMethod();
          }

          static secondStaticMethod() {
              // Some implementation
          }
       }
       `,
    }
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
    },
    {
      code: `
        function lowLevelFunction() {
            // implementation
        }
        
        function highLevelFunction() {
            lowLevelFunction();
        }
      `,
      errors: [{ message: `'lowLevelFunction' ${errMsg}` }]
    },

    {
      code: `
        class ExampleClass {
          midLevelMethod() {
              this.lowLevelMethod();
          }

          highLevelMethod() {
              this.midLevelMethod();
          }

          lowLevelMethod() {
              // Implementation details
          }
      }
      `,
      errors: [{ message: `'midLevelMethod' ${errMsg}` }]
    },
    {
      code: `
        class ExampleClass {
          midLevelMethod() {
              this.lowLevelMethod();
          }

          highLevelMethod() {
              this.midLevelMethod();
          }

          lowLevelMethod() {
              // Implementation details
          }
      }
      `,
      errors: [{ message: `'midLevelMethod' ${errMsg}` }]
    },
    {
      code: `
        class ExternalDependencyClass {
          firstMethod() {
              externalFunction();
          }

          secondMethod() {
              this.firstMethod();
          }
      }
      `,
      errors: [{ message: `'firstMethod' ${errMsg}` }]
    },
  ]
});