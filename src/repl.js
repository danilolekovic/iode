var readline = require('readline'),
  fs = require("fs"),
  path = require("path");
var rl = readline.createInterface(process.stdin, process.stdout);
var generator = require("./compiler");
var code = "";
var std = fs.readFileSync(path.dirname(__dirname) + '/lib/prelude.stps',
  'utf8');

console.log("stripes> STRIPES v" + require("../package.json").version +
  " INTERACTIVE CONSOLE");
console.log("stripes> TYPE RUN;; TO EXECUTE CODE. TYPE CLOSE;; TO EXIT\n");
rl.setPrompt('stripes> ');
rl.prompt();

rl.on('line', function(line) {
  if (line.trim() == "close;;") rl.close();
  if (line.trim() == "clear;;") code = "";

  if (line.trim() == "run;;") {
    repl();
    code = "";
  } else if (line.endsWith("run;;")) {
    code += line.substring(0, line.length - "run;;".length);
    repl();
    code = "";
  } else if (line.endsWith("code;;") || line.trim() == "code;;") {
    console.log("stps> " + code);
    console.log("js> " + generator.main(code));
  } else {
    code = code + line;
  }

  rl.prompt();
}).on('close', function() {
  process.exit(0);
});

var repl = function() {
  var js = generator.main(std + code);
  console.log("> " + eval(js));
};

String.prototype.endsWith = function(suffix) {
  return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
