var generator = require("./compiler");

var code =
	'unless (false) console.log("Good."); end;';

var start = new Date();

setTimeout(function(argument) {
	console.log(generator.main(code));
	var end = new Date() - start;
	console.log(1000 * (end / 1000) + "ms");
}, 0);
