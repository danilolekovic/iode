var iode = require('../package.json'),
  Parser = require('./parser.js').Parser,
  beauty = require('js-beautify').js_beautify,
  readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

var line = 1;
var currentCode = "";

rl.setPrompt('[' + line + '] iode> ');
rl.prompt();

rl.on('line', function(code) {
    runCode(code);
}).on('close', function() {
  console.log('~ Iode Closed ~');
  process.exit(0);
});;

var runCode = function(code) {
  if (code == "R") {
    eval(genCode(currentCode + "\n"));
    currentCode = "";
    line = 1;
    rl.setPrompt('[' + line + '] iode>');
    rl.prompt();
  } else if (code == "C") {
    console.log("\n" + genCode(currentCode + "\n") + "\n");
    currentCode = "";
    line = 1;
    rl.setPrompt('[' + line + '] iode>');
    rl.prompt();
  } else if (code == "CR" || code == "RC") {
    eval(genCode(currentCode + "\n"));
    console.log("\n" + genCode(currentCode + "\n") + "\n");
    currentCode = "";
    line = 1;
    rl.setPrompt('[' + line + '] iode>');
    rl.prompt();
  } else {
    currentCode += "\n" + code;
    line++;
    rl.setPrompt('[' + line + '] iode>');
    rl.prompt();
  }
};

var genCode = function(code) {
  var parser = new Parser(code.toString() + '\n', null);
  var ast = parser.parse();
  var outputCode = '';

  try {
    for (var expr in ast) {
      outputCode += '\n' + ast[expr].val;
    }
  } catch (e) {
    console.error('[x] Could not generate code. ' + e);
  }

  outputCode = beauty(outputCode, { indent_size: 2 });
  return outputCode;
};
