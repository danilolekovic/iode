var generator = require("./compiler"),
		nodeunit = require("nodeunit");

exports.IfStatement = function(test) {
    test.equal("if (true) {console.log('cool');}", generator.GenerateStripes("if (true) console.log('cool'); end;"));
    test.done();
};

exports.UnlessStatement = function(test) {
    test.equal("if (!(true)) {console.log('cool');}", generator.GenerateStripes("unless (true) console.log('cool'); end;"));
    test.done();
};

exports.ElseIfStatement = function(test) {
    test.equal("if (true) {console.log('cool');}else if (false) {console.log('yay');}",
							generator.GenerateStripes("if (true) console.log('cool'); end; elsif (false) console.log('yay'); end;"));
    test.done();
};

exports.ElseStatement = function(test) {
    test.equal("if (true) {console.log('cool');}else {console.log('yay');}",
							generator.GenerateStripes("if (true) console.log('cool'); end; else console.log('yay'); end;"));
    test.done();
};

exports.VariableDeclaration = function(test) {
    test.equal("var a = 2;", generator.GenerateStripes("let a = 2;"));
    test.done();
};

exports.VariableSetting = function(test) {
    test.equal("a = 2;", generator.GenerateStripes("a = 2;"));
    test.done();
};

exports.Range = function(test) {
    test.equal("a = [1,2,3,4];", generator.GenerateStripes("a = [1..4];"));
    test.done();
};

exports.Comments = function(test) {
    test.equal("/* Swag */", generator.GenerateStripes("# Swag #;"));
    test.done();
};

exports.Repeat = function(test) {
    test.equal("for (var i = 1; i <= 5; i++) {}", generator.GenerateStripes("repeat (5:i) end;"));
    test.done();
};
