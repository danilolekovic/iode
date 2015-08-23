var parser = require("./grammar"),
		fs = require("fs"),
		path = require("path"),
		separator = require("path").sep,
		version = "0.0.82",
		error = require("./errors").err;;

var finals = [];
var allVariables = [];
var variablesWithTypes = [];

var reserved = ["abstract", "else", "instanceof", "super", "boolean", "enum",
	"int", "switch", "break", "export", "interface", "synchronized", "byte",
	"extends", "let", "this", "case", "false", "long", "throw", "catch",
	"final", "native", "throws", "char", "finally", "new", "transient", "class",
	"float", "null", "true", "const", "for", "package", "try", "continue",
	"function", "private", "typeof", "debugger", "goto", "protected", "var",
	"default", "if", "public", "void", "delete", "implements", "return",
	"volatile", "do", "import", "short", "while", "double", "in", "static",
	"with", "case", "of", "is", "not", "fn", "isnt", "class",
	"unless", "repeat", "yes", "no", "nothing"
];

var PushVariable = function(n, t) {
	for (a in variablesWithTypes) {
		if (variablesWithTypes[a].name == n) {
			variablesWithTypes[a].type = t;
			return;
		}
	}

	variablesWithTypes.push({ name: n, type: t});
};

var TYPES = {
    'number'           : 'number',
    'boolean'          : 'boolean',
    'string'           : 'string',
    'object'				   : 'object',
		'function'				 : 'function'
},
TOSTRING = Object.prototype.toString;

var type = function(o) {
    return TYPES[typeof o] || TYPES[TOSTRING.call(o)] || (o ? 'object' : 'null');
};

var Generate = function(ast) {
	switch (ast[0]) {
		case "Stripes":
			return ast.slice(2).reduce(function(prev, now) { return prev + Generate(now); }, "");
			break;
		case "EOF":
			return "";
			break;
		case "Number":
			return parseFloat(ast[1].replace(/_/g, ""));
			break;
		case "Pointer":
			return ast[1].substring(0, ast[1].length - 1) + ".val";
			break;
		case "Yes":
			return true;
			break;
		case "No":
			return false;
			break;
		case "Nothing":
			return null;
			break;
		case "Unknown":
			return undefined;
			break;
		case "Percent":
			return parseFloat(ast[1].replace(/_/g, "")) / 100.0;
			break;
		case "Ident":
			if (reserved.contains(ast[1])) {
				error("Illegal identifier discovered: " + ast[1] + ".");
			}

			return ast[1];
			break;
		case "String":
			var string = ast[1];
			string = string.substring(1, string.length - 1);

      var reg = /\\\((.*)\)/g;
      var matches = [], found;

      while (found = reg.exec(string)) {
				string.replace(string[0].substring(6, string[0].length - 7), "\"" + string[0].substring(6, string[0].length - 7) + "\"");
      }

			return "\"" + string + "\"";
			break;
		case "SingleString":
			var string = ast[1];
			string = string.substring(1, string.length - 1);

			string = string.replace(/\\\((.*)\)/g,
				function(a) {
					return "' + " + a + " + '"
				}
			);

			return "'" + string + "'";
			break;
		case "RandomOp":
			var min = Generate(ast[1]);
			var max = Generate(ast[2]);

			return "Math.random() * (" + max + " - " + min + ") + " + min;
			break;
		case "RandomGen":
			return "Math.random()";
			break;
		case "CallAssignFromObject":
			var a = [];

			Generate(ast[3]).substring(1, Generate(ast[3]).length - 1).split(', ').forEach(
				function(entry) {
					a.push(entry);
				});

			var final = "";

			for (var i = 0; i <= a.length; i++) {
				if (a[i] != undefined) {
					final += Generate(ast[1]) + "." + a[i] + " = " + Generate(ast[2]) + "." + a[i] +
						";";
				}
			}

			return final;
			break;
		case "AssignFromObject":
			var a = [];

			Generate(ast[3]).substring(1, Generate(ast[3]).length - 1).split(', ').forEach(
				function(entry) {
					a.push(entry);
				});

			var final = "";

			for (var i = 0; i <= a.length; i++) {
				if (a[i] != undefined) {
					final += ast[1] + "." + a[i] + " = " + Generate(ast[2]) + "." + a[i] +
						";";
				}
			}

			return final;
			break;
		case "SetVarType":
			if (finals.contains(ast[2])) {
				error("Variable '" + ast[2] +
					"' is final and cannot be modified.");
			}

			if (ast[1] != "string" && ast[1] != "boolean" && ast[1] != "number" && ast[1] != "object" && ast[1] != "function" && ast[1] != "null" && ast[1] != "undefined"
					&& ast[1] != "date" && ast[1] != "array") {
				error("Unknown type (" + ast[1] + ") specified when setting variable '" + ast[2] + "'.");
			}

			PushVariable(ast[2], ast[1]);

			if (ast[1] == "array" || ast[1] == "date") {
				return "if (" + ast[2] + ".constructor.toString().indexOf(" + ast[1].charAt(0).toUpperCase() + ast[1].slice(1) + ") > -1) {" + ast[2] + " = " + Generate(ast[3]) + ";" + "}"
					+ "else { error('Expecting a type of " + ast[1] + ".'); }";
			}

			return "if (typeof (" + Generate(ast[3]) + ") === " + ast[1] + ") { " + ast[2] + " = " + Generate(ast[3]) + ";" + "}"
				+ "else { error('Expecting a type of " + ast[1] + ".'); }";
			break;
		case "ArrowFunction":
			return "function" + Generate(ast[1]) + " { return " + Generate(ast[2]) + "; }";
			break;
		case "DecVarType":
			if (finals.contains(ast[2])) {
				error("Variable '" + ast[2] +
					"' is final and already declared.");
			}

			if (ast[1] != "string" && ast[1] != "boolean" && ast[1] != "number" && ast[1] != "object" && ast[1] != "function" && ast[1] != "null" && ast[1] != "undefined"
					&& ast[1] != "date" && ast[1] != "array") {
				error("Unknown type (" + ast[1] + ") specified when setting variable '" + ast[2] + "'.");
			}

			PushVariable(ast[2], ast[1]);

			if (ast[1] == "array" || ast[1] == "date") {
				return "if (" + Generate(ast[3]) + ".constructor.toString().indexOf(" + ast[1].charAt(0).toUpperCase() + ast[1].slice(1) + ") > -1) {" + ast[2] + " = " + Generate(ast[3]) + ";" + "}"
					+ "else { error('Expecting a type of " + ast[1] + ".'); }";
			}

			return "var " + ast[2] + ";if (typeof (" + Generate(ast[3]) + ") === '" + ast[1] + "') { " + ast[2] + " = " + Generate(ast[3]) + ";" + "}"
				+ "else { error('Expecting a type of " + ast[1] + ".'); }";
			break;
		case "FinalVarType":
			if (finals.contains(ast[2]) || allVariables.contains(ast[2])) {
				error("Variable '" + ast[2] + "' is declared twice.");
			} else {
				finals.push(ast[2]);
			}

			if (ast[1] != "string" && ast[1] != "boolean" && ast[1] != "number" && ast[1] != "object" && ast[1] != "function" && ast[1] != "null" && ast[1] != "undefined"
					&& ast[1] != "date" && ast[1] != "array") {
				error("Unknown type (" + ast[1] + ") specified when setting variable '" + ast[2] + "'.");
			}

			PushVariable(ast[2], ast[1]);

			if (ast[1] == "array" || ast[1] == "date") {
				return "if (" + Generate(ast[3]) + ".constructor.toString().indexOf(" + ast[1].charAt(0).toUpperCase() + ast[1].slice(1) + ") > -1) {" + ast[2] + " = " + Generate(ast[3]) + ";" + "}"
					+ "else { error('Expecting a type of " + ast[1] + ".'); }";
			}

			return "var " + ast[2] + ";if (typeof (" + Generate(ast[3]) + ") === '" + ast[1] + "') { " + ast[2] + " = " + Generate(ast[3]) + ";" + "}"
				+ "else { error('Expecting a type of " + ast[1] + ".'); }";
			break;
		case "SetVar":
			if (finals.contains(ast[1])) {
				error("Variable '" + ast[1] +
					"' is final and cannot be modified.");
			}

			for (a in variablesWithTypes) {
				if (variablesWithTypes[a].name == ast[1]) {
					if (variablesWithTypes[a].type == "array" || variablesWithTypes[a].type == "date") {
						return "if (" + Generate(ast[2]) + ".constructor.toString().indexOf(" + variablesWithTypes[a].type.charAt(0).toUpperCase() + variablesWithTypes[a].type.slice(1) + ") > -1) {" + ast[1] + " = " + Generate(ast[2]) + ";" + "}"
							+ "else { error('Expecting a type of " + variablesWithTypes[a].type + ".'); }";
					}

					return "if (typeof " + Generate(ast[2]) + " === '" + variablesWithTypes[a].type + "') { " + ast[1] + " = " + Generate(ast[2]) + ";" + "}"
						+ "else { error('Expecting a type of " + variablesWithTypes[a].type + ".'); }";
				}
			}

			return ast[1] + " = " + Generate(ast[2]) + ";";
			break;
		case "SetVarCall":
			if (finals.contains(Generate(ast[1]))) {
				error("Variable '" + Generate(ast[1]) +
					"' is final and cannot be modified.");
			}

			for (a in variablesWithTypes) {
				if (variablesWithTypes[a].name == Generate(ast[1])) {
					if (variablesWithTypes[a].type == "array" || variablesWithTypes[a].type == "date") {
						return "if (" + Generate(ast[1]) + ".constructor.toString().indexOf(" + variablesWithTypes[a].type.charAt(0).toUpperCase() + variablesWithTypes[a].type.slice(1) + ") > -1) {" + Generate(ast[1]) + " = " + Generate(ast[2]) + ";" + "}"
							+ "else { error('Expecting a type of " + variablesWithTypes[a].type + ".'); }";
					}

					return "if (typeof " + Generate(ast[2]) + " === '" + variablesWithTypes[a].type + "') { " + Generate(ast[1]) + " = " + Generate(ast[2]) + ";" + "}"
						+ "else { error('Expecting a type of " + variablesWithTypes[a].type + ".'); }";
				}
			}

			return Generate(ast[1]) + " = " + Generate(ast[2]) + ";";
			break;
		case "SetOr":
			if (finals.contains(Generate(ast[1]))) {
				error("Variable '" + Generate(ast[1]) +
					"' is final and cannot be modified.");
			}

			if (finals.contains(Generate(ast[2]))) {
				error("Variable '" + Generate(ast[2]) +
					"' is final and cannot be modified.");
			}

			for (a in variablesWithTypes) {
				if (variablesWithTypes[a].name == Generate(ast[1])) {
					if (variablesWithTypes[a].type == "array" || variablesWithTypes[a].type == "date") {
						return "if (" + Generate(ast[1]) + ".constructor.toString().indexOf(" + variablesWithTypes[a].type.charAt(0).toUpperCase() + variablesWithTypes[a].type.slice(1) + ") > -1) {"
							+ "if (typeof " + Generate(ast[1]) + " !== 'undefined') { " +
							Generate(ast[1]) + " = " + Generate(ast[3]) + "; } else { " +
							Generate(ast[2]) + " = " + Generate(ast[3]) + "; }"
							+ "} else { error('Expecting a type of " + variablesWithTypes[a].type + ".'); }";
					}

					return "if (typeof " + Generate(ast[1]) + " === '" + variablesWithTypes[a].type + "') {"
						+ "if (typeof " + Generate(ast[1]) + " !== 'undefined') { " +
						Generate(ast[1]) + " = " + Generate(ast[3]) + "; } else { " +
						Generate(ast[2]) + " = " + Generate(ast[3]) + "; }"
						+ "}  error('Expecting a type of " + variablesWithTypes[a].type + ".'); }";
				}

				if (variablesWithTypes[a].name == Generate(ast[2])) {
					if (variablesWithTypes[a].type == "array" || variablesWithTypes[a].type == "date") {
						return "if (" + Generate(ast[2]) + ".constructor.toString().indexOf(" + variablesWithTypes[a].type.charAt(0).toUpperCase() + variablesWithTypes[a].type.slice(1) + ") > -1) {"
							+ "if (typeof " + Generate(ast[2]) + " !== 'undefined') { " +
							Generate(ast[1]) + " = " + Generate(ast[3]) + "; } else { " +
							Generate(ast[2]) + " = " + Generate(ast[3]) + "; }"
							+ "} else { error('Expecting a type of " + variablesWithTypes[a].type + ".'); }";
					}

					return "if (typeof " + Generate(ast[2]) + " === '" + variablesWithTypes[a].type + "') {"
						+ "if (typeof " + Generate(ast[2]) + " !== 'undefined') { " +
						Generate(ast[1]) + " = " + Generate(ast[3]) + "; } else { " +
						Generate(ast[2]) + " = " + Generate(ast[3]) + "; }"
						+ "}  error('Expecting a type of " + variablesWithTypes[a].type + ".'); }";
				}
			}

			return "if (typeof " + Generate(ast[1]) + " !== 'undefined') { " +
				Generate(ast[1]) + " = " + Generate(ast[3]) + "; } else { " +
				Generate(ast[2]) + " = " + Generate(ast[3]) + "; }";
			break;
		case "IndexSetVar":
			return Generate(ast[1]) + " = " + Generate(ast[2]) + ";";
			break;
		case "DecVar":
			if (finals.contains(ast[1])) {
				error("Variable '" + ast[1] +
					"' is final and already declared.");
			}

			for (a in variablesWithTypes) {
				if (variablesWithTypes[a].name == ast[1]) {
					error("Cannot re-declare a variable ('" + ast[1] + "') that has already been given a type.");
				}
			}

			return "var " + ast[1] + " = " + Generate(ast[2]) + ";";
			break;
		case "ReferableVar":
			if (finals.contains(Generate(ast[1]))) {
				error("Variable '" + Generate(ast[1]) +
					"' is final and already declared.");
			}

			for (a in variablesWithTypes) {
				if (variablesWithTypes[a].name == ast[1]) {
					error("Cannot re-declare a variable ('" + ast[1] + "') that has already been given a type.");
				}
			}

			return "var " + Generate(ast[1]).substring(0, Generate(ast[1]).length - 4) + " = { val:" + Generate(ast[2]) + " };";
			break;
		case "PointerPlusEq":
			return Generate(ast[1]) + " += " + Generate(ast[2]) + ";";
			break;
		case "PointerMinusEq":
			return Generate(ast[1]) + " -= " + Generate(ast[2]) + ";";
			break;
		case "PointerPushArray":
			return Generate(ast[1]) + ".push(" + Generate(ast[2]) + ");";
			break;
		case "FinalVar":
			if (finals.contains(ast[1]) || allVariables.contains(ast[1])) {
				error("Variable '" + ast[1] + "' is declared twice.");
			} else {
				finals.push(ast[1]);
			}

			for (a in variablesWithTypes) {
				if (variablesWithTypes[a].name == ast[1]) {
					error("Cannot re-declare a variable ('" + ast[1] + "') that has already been given a type.");
				}
			}

			return "var " + ast[1] + " = " + Generate(ast[2]) + ";";
			break;
		case "DecVarEmpty":
			if (finals.contains(ast[1])) {
				error("Variable '" + ast[1] +
					"' is final and already declared.");
			}

			return "var " + ast[1] + ";";
			break;
		case "FinalVarEmpty":
			if (finals.contains(ast[1]) || allVariables.contains(ast[1])) {
				error("Variable '" + ast[1] + "' is declared twice.");
			} else {
				finals.push(ast[1]);
			}

			error("Final variable '" + ast[1] +
				"' has been declared without a value.");

			return "var " + ast[1] + ";";
			break;
		case "Expo":
			return Generate(ast[1]) + "^" + Generate(ast[2]);
			break;
		case "PlusEq":
			return Generate(ast[1]).substring(0, Generate(ast[1]).length - 1) + "+=" + Generate(ast[2]) + ";";
			break;
		case "MinusEq":
			return Generate(ast[1]).substring(0, Generate(ast[1]).length - 1) + "-=" + Generate(ast[2]) + ";";
			break;
		case "CallPlusEq":
			return Generate(ast[1]) + "+=" + Generate(ast[2]) + ";";
			break;
		case "CallMinusEq":
			return Generate(ast[1]) + "-=" + Generate(ast[2]) + ";";
			break;
		case "Add":
			return Generate(ast[1]) + "+" + Generate(ast[2]);
			break;
		case "Sub":
			return Generate(ast[1]) + "-" + Generate(ast[2]);
			break;
		case "Mul":
			return Generate(ast[1]) + "*" + Generate(ast[2]);
			break;
		case "Div":
			return Generate(ast[1]) + "/" + Generate(ast[2]);
			break;
		case "Mod":
			return "(" + Generate(ast[1]) + "%" + Generate(ast[2]) + "+" + Generate(
				ast[
					2]) + ")%" + Generate(ast[2]);
			break;
		case "HasArray":
			return Generate(ast[2]) + ".indexOf(\"" + Generate(ast[1]) +
				"\") !== -1";
			break;
		case "PushArray":
			return Generate(ast[1]).substring(0, Generate(ast[1]).length - 1) + ".push(" + Generate(ast[2]) + ");";
			break;
		case "If":
			var inside = "";

			if (Generate(ast[1]) == "()") {
				error("No parameter for if statement.");
			}

			if (ast[2] == "end") {
				return "if " + Generate(ast[1]) + " {}";
			}

			ast[2].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in if statement.");
				}

				inside += a;
			});

			return "if " + Generate(ast[1]) + " {" + inside + "}";
			break;
		case "InstanceCondition":
			return Generate(ast[1]) + " instanceof " + Generate(ast[2]);
			break;
		case "TypeCondition":
			return "typeof (" + Generate(ast[1]) + ") === \"" + Generate(ast[2]) + "\"";
			break;
		case "And":
			return "&&";
			break;
		case "Or":
			return "||";
			break;
		case "Elsif":
			var inside = "";

			if (Generate(ast[1]) == "()") {
				error("No parameter for elsif statement.");
			}

			if (ast[2] == "end") {
				return "else if " + Generate(ast[1]) + " {}";
			}

			ast[2].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in elsif statement.");
				}

				inside += a;
			});

			return "else if " + Generate(ast[1]) + " {" + inside + "}";
			break;
		case "Else":
			var inside = "";

			if (ast[1] == "end") {
				return "else {}";
			}

			ast[1].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in else statement.");
				}

				inside += a;
			});

			return "else {" + inside + "}";
			break;
		case "ForEach":
			var inside = "";

			if (ast[2] == "end") {
				return "for (var " + ast[1] + " in " + Generate(ast[2]) + ") {}";
			}

			ast[3].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in for each loop.");
				}

				inside += a;
			});

			return "for (var " + ast[1] + " in " + Generate(ast[2]) + ") {" +
				inside + "}";
			break;
		case "ForKeyVal":
			var inside = "";

			if (ast[2] == "end") {
				return "for (var " + ast[1] + " in " + Generate(ast[3]) + ") { var " +
					ast[2] + " = " + Generate(ast[3]) + "[" + ast[1] + "]; }";
			}

			ast[4].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in for array iteration loop.");
				}

				inside += a;
			});

			return "for (var " + ast[1] + " in " + Generate(ast[3]) + ") { var " +
				ast[2] + " = " + Generate(ast[3]) + "[" + ast[1] + "]; " +
				inside + " }";
			break;
		case "For":
			var inside = "";

			if (ast[2] == "end") {
				return "for (" + Generate(ast[1]) + " " + Generate(ast[2]) + "; " +
					Generate(ast[3]) + ") {}";
			}

			ast[4].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in for loop.");
				}

				inside += a;
			});

			return "for (" + Generate(ast[1]) + " " + Generate(ast[2]) + "; " +
				Generate(ast[3]) + ") {" +
				inside + "}";
			break;
		case "Unless":
			var inside = "";

			if (Generate(ast[1]) == "()") {
				error("No parameter for unless statement.");
			}

			if (ast[2] == "end") {
				return "if (!" + Generate(ast[1]) + ") {}";
			}

			ast[2].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in unless statement.");
				}

				inside += a;
			});

			return "if (!" + Generate(ast[1]) + ") {" + inside + "}";
			break;
		case "DefaultVar":
			return "if (!(" + Generate(ast[1]) + " !== null && " + Generate(ast[1]) + " !== undefined)) { " + Generate(ast[1]) + " = " + Generate(ast[2]) + "; }";
			break;
		case "Function":
			var inside = "";

			if (ast[2] == "end") {
				return "function" + Generate(ast[1]) + " {}";
			}

			ast[2].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in function.");
				}

				inside += a;
			});

			if (!(Generate(ast[1]).substring(0, 1) == "(")) {
				return "function() {" + inside + "}";
			}

			return "function" + Generate(ast[1]) + " {" + inside + "}";
			break;
		case "PrivateFunction":
			var inside = "";

			if (ast[3] == "end") {
				return "function " + ast[1] + Generate(ast[2]) + " {}";
			}

			ast[3].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in private function.");
				}

				inside += a;
			});

			if (!(Generate(ast[2]).substring(0, 1) == "(")) {
				return "function " + ast[1] + "() {" + inside + "}";
			}

			return "function " + ast[1] + Generate(ast[2]) + " {" + inside + "}";
			break;
		case "Prototype":
			var inside = "";

			if (ast[4] == "end") {
				return ast[1] + ".prototype." + ast[2] + " = function" + Generate(ast[3]) +
					" {};";
			}

			ast[4].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in prototype.");
				}

				inside += a;
			});

			if (!(Generate(ast[3]).substring(0, 1) == "(")) {
				return ast[1] + ".prototype." + ast[2] + " = function() {" + inside + "};";
			}

			return ast[1] + ".prototype." + ast[2] + " = function" + Generate(ast[3]) +
				" {" + inside + "};";
			break;
		case "Default":
			return ast[1];
			break;
		case "While":
			var inside = "";

			if (Generate(ast[1]) == "()") {
				error("No parameter for while loop.");
			}

			if (ast[2] == "end") {
				return "while (" + Generate(ast[1]) + ") {}";
			}

			ast[2].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in while loop.");
				}

				inside += a;
			});

			return "while " + Generate(ast[1]) + " {" + inside + "}";
			break;
		case "DoWhile":
			var inside = "";

			if (Generate(ast[2]) == "()") {
				error("No parameter for do while statement.");
			}

			if (ast[1] == "end") {
				return "do {} while (" + Generate(ast[2]) + ");";
			}

			ast[1].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in do while loop.");
				}

				inside += a;
			});

			return "do {" + inside + "} while " + Generate(ast[2]) + ";";
			break;
		case "Until":
			var inside = "";

			if (Generate(ast[1]) == "()") {
				error("No parameter for until statement.");
			}

			if (ast[2] == "end") {
				return "while (!(" + Generate(ast[1]) + ")) {}";
			}

			ast[2].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in until loop.");
				}

				inside += a;
			});

			return "while (!" + Generate(ast[1]) + ") {" + inside + "}";
			break;
		case "DoUntil":
			var inside = "";

			if (Generate(ast[2]) == "()") {
				error("No parameter for do until loop.");
			}

			if (ast[1] == "end") {
				return "do {} while (!(" + Generate(ast[2]) + "));";
			}

			ast[1].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in do until loop.");
				}

				inside += a;
			});

			return "do {" + inside + "} while (!" + Generate(ast[2]) + ");";
			break;
		case "Repeat":
			var inside = "";

			if (ast[3] == "end") {
				return "for (var " + Generate(ast[2]) + " = 1; " + Generate(ast[2]) +
					" <= " + Generate(ast[
						1]) + "; " + Generate(ast[2]) + "++) {}";
			}

			ast[3].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in repeat loop.");
				}

				inside += a;
			});

			return "for (var " + Generate(ast[2]) + " = 1; " + Generate(ast[2]) +
				" <= " + Generate(ast[
					1]) + "; " + Generate(ast[2]) + "++) {" + inside + "}";
			break;
		case "Try":
			var inside = "";

			if (ast[1] == "end") {
				return "try {}";
			}

			ast[1].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in try statement.");
				}

				inside += a;
			});

			return "try {" +
				inside + "} " + Generate(ast[2]);
			break;
		case "Catch":
			var inside = "";

			if (ast[2] == "end") {
				return "catch (" + Generate(ast[1]) + ") {}";
			}

			ast[2].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in catch statement.");
				}

				inside += a;
			});

			return "catch (" + Generate(ast[1]) + ") {" + inside + "}";
			break;
		case "Do":
			var inside = "";

			if (ast[1] == "end") {
				return "(function() {})();";
			}

			ast[1].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in do statement.");
				}

				inside += a;
			});

			return "(function() {" + inside + "})();";
			break;
		case "This":
			return "this." + Generate(ast[1]);
			break;
		case "Condition":
			return Generate(ast[1]) + ast[2] + Generate(ast[3]);
			break;
		case "ConditionNot":
			return "!" + Generate(ast[1]);
			break;
		case "ArgElement":
			return Generate(ast[1]) + ", " + Generate(ast[2]);
			break;
		case "ArgumentList":
			return "(" + Generate(ast[1]) + ")";
			break;
		case "ExprList":
			return Generate(ast[1]) + ", " + Generate(ast[2]);
			break;
		case "CommaElement":
			return Generate(ast[1]) + ": case " + Generate(ast[2]);
			break;
		case "Commas":
			return Generate(ast[1]);
			break;
		case "CaseList":
			return Generate(ast[1]) + Generate(ast[2]);
			break;
		case "CondAndElement":
			return Generate(ast[1]) + " && " + Generate(ast[2]);
			break;
		case "CondOrElement":
			return Generate(ast[1]) + " || " + Generate(ast[2]);
			break;
		case "ConditionList":
			return "(" + Generate(ast[1]) + ")";
			break;
		case "ConditionCheck":
			return Generate(ast[1]) + " !== null && " + Generate(ast[1]) +
				" !== undefined";
			break;
		case "ConditionCheckOr":
			return Generate(ast[1]) + " ? " + Generate(ast[2]) + " : " + Generate(
				ast[3]);
			break;
		case "Empty":
			return "";
			break;
		case "IndexStmt":
			var ret = [];

			if (Generate(ast[2]).indexOf(',') != -1) {
				var all = Generate(ast[2]).substring(1, Generate(ast[2]).length - 1).split(', ');

				for (a in all) {
					ret.push("[" + all[a] + "]");
				}

				ret.pop();
			} else {
				ret.push(Generate(ast[2]));
			}

			return Generate(ast[1]).substring(0, Generate(ast[1]).length - 1) + ret.join("") + ";";
			break;
		case "Index":
			var ret = [];

			if (Generate(ast[2]).indexOf(',') != -1) {
				var all = Generate(ast[2]).substring(1, Generate(ast[2]).length - 1).split(', ');

				for (a in all) {
					ret.push("[" + all[a] + "]");
				}

				ret.pop();
			} else {
				ret.push(Generate(ast[2]));
			}

			return Generate(ast[1]) + ret.join("");
			break;
		case "IndexCall":
			var ret = [];

			if (Generate(ast[2]).indexOf(',') != -1) {
				var all = Generate(ast[2]).substring(1, Generate(ast[2]).length - 1).split(', ');

				for (a in all) {
					ret.push("[" + all[a] + "]");
				}

				ret.pop();
			} else {
				ret.push(Generate(ast[2]));
			}

			return Generate(ast[1]) + ret.join("") + "." + Generate(ast[3]);
			break;
		case "Plus":
			return Generate(ast[1]) + " += 1";
			break;
		case "Minus":
			return Generate(ast[1]) + " -= 1";
			break;
		case "Return":
			return "return " + Generate(ast[1]);
			break;
		case "New":
			return "new " + ast[1] + Generate(ast[2]);
			break;
		case "Comment":
			return "/*" + ast[1].substring(1, ast[1].length - 1) + "*/";
			break;
		case "Array":
			return '[' + Generate(ast[1]) + ']';
			break;
		case "ArrayElement":
			return Generate(ast[1]) + ", " + Generate(ast[2]);
			break;
		case "CallArray":
			return Generate(ast[1]);
			break;
		case "CallArrayStmt":
			return Generate(ast[1]) + ";";
			break;
		case "CallElement":
			return Generate(ast[1]) + "." + Generate(ast[2]);
			break;
		case "CallExpr":
			var a = Generate(ast[2]);

			if (ast[1] == "throw" || ast[1] == "return" || ast[1] == "instanceof" ||
				ast[1] == "typeof" || ast[1] == "void") {
				return ast[1] + " " + a.substring(1, a.length - 1);
			}

			return ast[1] + "(" + a.substring(1, a.length - 1) + ")";
			break;
		case "CallExprNoArgs":
			if (ast[1] == "throw" || ast[1] == "return" || ast[1] == "instanceof" ||
				ast[1] == "typeof" || ast[1] == "yield" || ast[1] == "continue" ||
				ast[1] == "break") {
				if (a == undefined) {
					return ast[1];
				} else {
					return ast[1] + " " + a.substring(1, a.length - 1);
				}
			}

			return ast[1];
			break;
		case "CallExprLiteral":
			return Generate(ast[1]);
			break;
		case "Class":
			if (finals.contains(ast[1])) {
				error("Class '" + ast[1] +
					"' is final and already declared.");
			}

			if (ast[3] == "end") {
				return 'function ' + ast[1] + Generate(ast[2]) + ' {}';
			}

			return 'function ' + ast[1] + Generate(ast[2]) + ' {' + Generate(
				ast[3]).substring(0,
				Generate(ast[3]).length - 1) + '}';
			break;
		case "ClassList":
			return Generate(ast[1]) + Generate(ast[2])
			break;
		case "ClassElement":
			return "this." + Generate(ast[1]) + " = " + Generate(ast[2]) + ";";
			break;
		case "Extends":
			return "Object.create(" + ast[1] + ")";
			break;
		case "Element":
			return Generate(ast[1]) + ":" + Generate(ast[2]) + ",";
			break;
		case "JSON":
			return '{' + Generate(ast[1]).substring(0,
				Generate(ast[1]).length - 1) + '}';
			break;
		case "CaseElement":
			var inside = "";

			if (ast[2] == "end") {
				return "case " + Generate(ast[1]) + ": break;";
			}

			ast[2].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in case.");
				}

				inside += a;
			});

			return "case " + Generate(ast[1]) + ":" + inside + "break;";
			break;
		case "DefaultCaseElement":
			var inside = "";

			if (ast[1] == "end") {
				return "default:";
			}

			ast[1].forEach(function(entry) {
				var a = Generate(entry);

				if (entry.contains("FinalVar") || entry.contains("FinalVarType" || entry.contains("FinalVarEmpty"))) {
					error("Final non-global variable declared in default within a case statement.");
				}

				inside += a;
			});

			return "default:" + inside;
			break;
		case "CaseL":
			return Generate(ast[1]);
			break;
		case "Case":
			return "switch (" + Generate(ast[1]) + ") {" + Generate(ast[2]) + "}";
			break;
		case "JSONList":
			return Generate(ast[1]) + Generate(ast[2])
			break;
		case "EmptyJSON":
			return "{}";
			break;
		case "EmptyArray":
			return "[]";
			break;
		case "EmptyArgs":
			return "()";
			break;
		case "Range":
			// todo: letters

			var first = Generate(ast[1]);
			var second = Generate(ast[2]);

			if (ast[1][0] == "Number" && ast[2][0] == "Number") {
				return getNumbers(first + ".." + second);
			}

			return "(function() { var results = []; for (var _k = " + first + "; " + first + " <= " + second + " ? _k <= " + second + " : _k >= " + second + "; " + first + " <= " + second + " ? _k++ : _k--){ results.push(_k); } return results; }).apply(this)";
			break;
		case "LessRange":
			var first = Generate(ast[1]);
			var second = Generate(ast[2]);

			if (ast[1][0] == "Number" && ast[2][0] == "Number") {
				return getNumbers((Number(first) - 1) + ".." + second);
			}

			return "(function() { var results = []; for (var _k = " + first + " - 1; " + first + " <= " + second + " ? _k <= " + second + " : _k >= " + second + "; " + first + " <= " + second + " ? _k++ : _k--){ results.push(_k); } return results; }).apply(this)";
			break;
		case "Regex":
			return ast[1];
			break;
		case "ArraySet":
			var a = [];
			var b = [];

			if (Generate(ast[1]) == "()" || Generate(ast[2]) == "()") {
				error("Empty group for mass variable setting.");
			}

			Generate(ast[1]).substring(1, Generate(ast[1]).length - 1).split(', ').forEach(
				function(entry) {
					if (finals.contains(entry)) {
						error("Variable '" + entry +
							"' is final and cannot be modified.");
					}
					a.push(entry);
				});

			Generate(ast[2]).substring(1, Generate(ast[2]).length - 1).split(', ').forEach(
				function(entry) {
					b.push(entry);
				});

			if (a.length != b.length) {
				error("Insufficient parameters. " + a +
					" is not the same length as " + b + ".");
			}

			var final = "";

			for (var i = 0; i <= a.length; i++) {
				if (a[i] != undefined) {
					var found = false;
					for (z in variablesWithTypes) {
						if (variablesWithTypes[z].name == a[i]) {
							found = true;
							final += "if (typeof (" + b[i] + ") == '" + variablesWithTypes[z].type + "') { " + a[i] + " = " + b[i] + "; }"
								+ "else { error('Expecting a type of " + variablesWithTypes[z].type + ".'); }";
						}
					}

					if (!found) {
						final += a[i] + " = " + b[i] + ";";
					} else {
						found = false;
					}
				}
			}

			return final;
			break;
		case "ArrayLet":
			var a = [];
			var b = [];

			if (Generate(ast[1]) == "()" || Generate(ast[2]) == "()") {
				error("Empty group for mass variable creation.");
			}

			Generate(ast[1]).substring(1, Generate(ast[1]).length - 1).split(', ').forEach(
				function(entry) {
					if (finals.contains(entry)) {
						error("Variable '" + entry +
							"' is final and already declared.");
					}

					for (z in variablesWithTypes) {
						if (variablesWithTypes[z].name == entry) {
							error("Cannot re-declare a variable ('" + entry + "') that has already been given a type.");
						}
					}

					a.push(entry);
				});

			Generate(ast[2]).substring(1, Generate(ast[2]).length - 1).split(', ').forEach(
				function(entry) {
					b.push(entry);
				});

			if (a.length != b.length) {
				error("Insufficient parameters. " + a +
					" is not the same length as " + b + ".");
			}

			var final = "";

			for (var i = 0; i <= a.length; i++) {
				if (a[i] != undefined) {
					final += "var " + a[i] + " = " + b[i] + ";";
				}
			}

			return final;
			break;
		case "ArrayLetEmpty":
			var a = [];

			if (Generate(ast[1]) == "()") {
				error("Empty group for mass variable declaration without a value.");
			}

			Generate(ast[1]).substring(1, Generate(ast[1]).length - 1).split(', ').forEach(
				function(entry) {
					if (finals.contains(entry)) {
						error("Variable '" + entry +
							"' is final and already declared.");
					}
					for (z in variablesWithTypes) {
						if (variablesWithTypes[z].name == entry) {
							error("Cannot re-declare a variable ('" + entry + "') that has already been given a type.");
						}
					}
					a.push(entry);
				});

			var final = "";

			for (var i = 0; i <= a.length; i++) {
				if (a[i] != undefined) {
					final += "var " + a[i] + ";";
				}
			}

			return final;
			break;
		case "Export":
			var a = [];

			Generate(ast[1]).substring(1, Generate(ast[1]).length - 1).split(', ').forEach(
				function(entry) {
					a.push(entry);
			});

			var final = "";

			for (var i = 0; i <= a.length; i++) {
				if (a[i] != undefined) {
					final += "exports." + a[i] + " = " + a[i] + ";";
				}
			}

			return final;
			break;
		case "ArrayFinal":
			var a = [];
			var b = [];

			if (Generate(ast[1]) == "()" || Generate(ast[2]) == "()") {
				error("Empty group for final mass variable creation.");
			}

			Generate(ast[1]).substring(1, Generate(ast[1]).length - 1).split(', ').forEach(
				function(entry) {
					if (finals.contains(entry) || allVariables.contains(entry)) {
						error("Variable '" + entry + "' is declared twice.");
					} else {
						finals.push(entry);
					}
					for (z in variablesWithTypes) {
						if (variablesWithTypes[z].name == entry) {
							error("Cannot re-declare a variable ('" + entry + "') that has already been given a type.");
						}
					}
					a.push(entry);
				});

			Generate(ast[2]).substring(1, Generate(ast[2]).length - 1).split(', ').forEach(
				function(entry) {
					b.push(entry);
				});

			if (a.length != b.length) {
				error("Insufficient parameters. " + a +
					" is not the same length as " + b + ".");
			}

			var f = "";

			for (var i = 0; i <= a.length; i++) {
				if (a[i] != undefined) {
					f += "var " + a[i] + " = " + b[i] + ";";
				}
			}

			return f;
			break;
		case "CallIf":
			if (Generate(ast[2]) == "()") {
				error("No parameter in call if statement.");
			}

			return "if " + Generate(ast[2]) + " {" + Generate(ast[1]) + "}";
			break;
		case "CallWhile":
			if (Generate(ast[2]) == "()") {
				error("No parameter in call while loop.");
			}

			return "while " + Generate(ast[2]) + " {" + Generate(ast[1]) + "}";
			break;
		case "CallUnless":
			if (Generate(ast[2]) == "()") {
				error("No parameter in call unless statement.");
			}

			return "if !(" + Generate(ast[2]) + ") {" + Generate(ast[1]) + "}";
			break;
		case "CallUntil":
			if (Generate(ast[2]) == "()") {
				error("No parameter in call until loop.");
			}

			return "while !(" + Generate(ast[2]) + ") {" + Generate(ast[1]) + "}";
			break;
		case "SetIf":
			if (Generate(ast[2]) == "()") {
				error("No parameter in set variable if statement.");
			}

			if (ast[1][0] == "DecVar") {
				ast[1][0] = "SetVar";
				return "var " + ast[1][1] + ";if " + Generate(ast[2]) + " {" + Generate(ast[1]) + "}";
			}

			return "if " + Generate(ast[2]) + " {" + Generate(ast[1]) + "}";
			break;
		case "SetUnless":
			if (Generate(ast[2]) == "()") {
				error("No parameter in set variable unless statement.");
			}

			if (ast[1][0] == "DecVar") {
				ast[1][0] = "SetVar";
				return "var " + ast[1][1] + ";if !(" + Generate(ast[2]) + ") {" + Generate(ast[1]) + "}";
			}

			return "if !(" + Generate(ast[2]) + ") {" + Generate(ast[1]) + "}";
			break;
		case "RunExpr":
			return Generate(ast[1]) + ";";
			break;
		case "Where":
			return "if " + Generate(ast[1]) + " { console.log('Unit Test (" + ast[2] + ") Passed.'); } else { error('Unit Test (" + ast[2] + ") Failed.'); }";
			break;
		case "WhereUnnamed":
			return "if " + Generate(ast[1]) + " { console.log('Unit Test Passed.'); } else { error('Unit Test Failed.'); }";
			break;
		case "Using":
			if (ast[1] == "convert") {
				return fs.readFileSync(path.dirname(__dirname) + separator + 'lib' + separator + 'convert.stps',
					'utf8');
			} else if (ast[1] == "functional") {
				return fs.readFileSync(path.dirname(__dirname) + separator + 'lib' + separator + 'functional.stps',
					'utf8');
			} else if (ast[1] == "all") {
				return fs.readFileSync(path.dirname(__dirname) + separator + 'lib' + separator + 'convert.stps',
					'utf8') + fs.readFileSync(path.dirname(__dirname) + separator + 'lib' + separator + 'functional.stps',
						'utf8');
			} else {
				error("Attempted to use invalid part of standard library: " + ast[1] + ".");
			}

			return "/* Using stripes." + ast[1] + " */";
			break;
		default:
			error("Unknown statement has been located: " + ast[0]);
	}
}

var getNumbers = function(stringNumbers) {
    var nums = [];
    var entries = stringNumbers.split(',');
    var length = entries.length;
    var i, entry, low, high, range;

    for (i = 0; i < length; i++) {
        entry = entries[i];

        if (!~entry.indexOf('..')) {
            nums.push(+entry);
        } else {
            range = entry.split('..');

            low = +range[0];
            high = +range[1];

            if(high < low){
              low = low ^ high;
              high = low ^ high;
              low = low ^ high;
            }

            while (low <= high) {
                nums.push(low++);
            }
        }
    }

    return nums.sort(function (a, b) {
        return a - b;
    });
}

var GenerateStripes = function(code) {
	return Generate(parser.parse(code.replace("\n", "")));
}

var getAST = function(code) {
	var a = require("js-beautify").js_beautify(JSON.stringify(parser.parse(
		code.replace("\n", ""))), {
		indent_size: 2
	});
	return a;
}

Array.prototype.contains = function(k) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == k) {
			return true;
		}
	}
	return false;
}

exports.GenerateStripes = GenerateStripes;
exports.getAST = getAST;
exports.Generate = Generate;
