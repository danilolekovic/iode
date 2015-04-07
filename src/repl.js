var readline = require('readline'),
  fs = require("fs"),
  path = require("path");
var rl = readline.createInterface(process.stdin, process.stdout);
var generator = require("./compiler");
var code = "";

console.log("stripes> STRIPES v" + require("../package.json").version +
  " INTERACTIVE CONSOLE");
console.log("stripes> TYPE RUN;; TO EXECUTE CODE. TYPE CLOSE;; TO EXIT\n");
rl.setPrompt('stripes> ');
rl.prompt();

rl.on('line', function(line) {
  code += line.trim();

  if (code.trim().endsWith("clear;;")) {
    code = "";
  } else if (code.trim().endsWith("close;;")) {
    rl.close();
  } else if (code.trim().endsWith("run;;")) {
    code = code.substring(0, code.length - 5);
    repl(true);
    code = "";
  } else if (code.trim().endsWith("run-no-lib;;")) {
    code = code.substring(0, code.length - 12);
    repl(false);
    code = "";
  } else if (code.trim().endsWith("code;;")) {
    code = code.substring(0, code.length - 6);
    console.log("\nstps> " + code);
    console.log("js> " + generator.GenerateStripes(code));
  } else if (code.trim().endsWith("ast;;")) {
    code = code.substring(0, code.length - 5);
    console.log("> " + generator.getAST(code));
  }

  rl.prompt();
}).on('close', function() {
  process.exit(0);
});

var repl = function(lib) {
  if (lib) {
    var js = generator.GenerateStripes(code);
    console.log("\n-> " + eval(js));
  } else {
    var js = generator.GenerateStripes(code);
    console.log("\-n> " + eval(js));
  }
};

String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
