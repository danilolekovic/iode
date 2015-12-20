var IodeIdentifier = function(val) {
	this.type = 'Identifer';
	this.val = val;
};

var IodeNumber = function(val) {
	this.type = 'Number';
	this.val = val.replace(/_/g, '');
};

var IodePercentage = function(val) {
	this.type = 'Number with Percent';
	this.val = '(' + val.replace(/_/g, '') + ' / 100)';
};

var IodeString = function(val) {
	this.type = 'String';
	this.val = getISValue(val);
};

var getISValue = function(val) {
	var string = val;
	var reg = /(.*)#{(.*)}(.*)/g;

	var matches = [],
		found;

	while (found = reg.exec(string)) {
		string = string.replace(reg, function($0, $1, $2, $3) {
			return $1 + '\" + ' + $2 + ' + \"' + $3;
		});
	}

	return '\"' + string + '\"';
};

var IodeBoolean = function(value) {
	this.type = 'Boolean';
	this.value = value;
	this.val = getIBValue(value);
};

var getIBValue = function(value) {
	switch (value) {
		case 'true':
			return 'true';
		case 'false':
			return 'false';
		case 'nil':
			return 'null';
		case 'undefined':
			return 'undefined';
		default:
			return 'null';
	}
};

var IodeBinaryOp = function(left, op, right) {
	this.type = 'Binary Op';
	this.left = left;
	this.op = op;
	this.right = right;
	this.val = getIBOValue(left, op, right);
};

var getIBOValue = function(left, op, right) {
	var lhs = left.val;

	if (right == undefined) {
		return lhs;
	}

	var rhs = right.val;

	if (op == '!=') {
		op = '!==';
	} else if (op == '==') {
		op = '===';
	}


	if (lhs.charAt(lhs.length - 1) == ';') {
		lhs = lhs.substring(0, lhs.length - 1);
	}

	if (rhs.charAt(rhs.length - 1) == ';') {
		rhs = rhs.substring(0, rhs.length - 1);
	}

	if (op == '**') {
		return 'Math.pow(' + lhs + ', ' + rhs + ')';
	}

	if (op == '%%') {
		op = '%';
	}

	return lhs + ' ' + op + ' ' + rhs;
};

var IodeParenthesis = function(value) {
	this.type = 'Parenthesis';
	this.value = value;
	this.val = '(' + this.value.val + ')';
};

var IodeVariableDeclaration = function(name, value, expectedType) {
	this.type = 'Variable Declaration';
	this.name = name;
	this.value = value;
	this.expectedType = expectedType;
	this.val = getIVDValue(name, value.val, expectedType);
};

var getIVDValue = function(name, value, expectedType) {
	if (expectedType == null) {
		if (value == null) {
			return 'var ' + name + ';';
		} else {
			if (value.charAt(value.length - 1) == ';') {
				return 'var ' + name + ' = ' + value;
			} else {
				return 'var ' + name + ' = ' + value + ';';
			}
		}
	} else {
		if (value == null) {
			return 'var ' + name + ';';
		} else {
			if (value.charAt(value.length - 1) == ';') {
				value = value.substring(0, value.length - 1);

				return 'var ' + name + ';\n\nif (typeof(' + value + ') === \"' + expectedType + '\") { ' + name + ' = ' + value + '; } else {' +
					'throw "Expected type of ' + expectedType + ' for var ' + name + '."; }';
			} else {
				return 'var ' + name + ';\n\nif (typeof(' + value + ') === \"' + expectedType + '\") { ' + name + ' = ' + value + '; } else {' +
					'throw "Expected type of ' + expectedType + ' for var ' + name + '."; }';
			}
		}
	}
};

var IodeVariableSetting = function(name, value) {
	this.type = 'Variable Setting';
	this.name = name;
	this.value = value;
	this.val = getIVSValue(name, value);
};

var getIVSValue = function(name, value) {
	return name + ' = ' + value.val + ';';
};

var generateBody = function(body) {
	if (body.length != 0) {
		body = body.map(function(stmt) {
			if (stmt.val.charAt(stmt.val.length - 1) == ';') {
				if (stmt.type == 'While' || stmt.type == 'Until' || stmt.type == 'If' || stmt.type == 'Foreach' || stmt.type == 'For'
						|| stmt.type == 'Repeat' || stmt.type == 'Foreach') {
					return stmt.val.substring(0, stmt.val.length - 1);
				} else {
					return stmt.val;
				}
			} else {
				if (stmt.type == 'While' || stmt.type == 'Until' || stmt.type == 'If' || stmt.type == 'Foreach' || stmt.type == 'For'
						|| stmt.type == 'Repeat' || stmt.type == 'Foreach') {
					return stmt.val + '\n';
				} else {
					if (stmt.type == 'Newline') {
						return stmt.val;
					} else {
						return stmt.val + ';';
					}
				}
			}
		});

		return body.join('\n');
	} else {
		return '';
	}
};

var IodePrototype = function(name, proto, args, body) {
	this.type = 'Prototype';
	this.name = name;
	this.proto = proto;
	this.args = args;
	this.body = body;
	this.val = getIProtoValue(name, proto, args, body);
};

var getIProtoValue = function(name, proto, args, body) {
	var a = '';
	var formatted = [];
	var defaults = [];

	if (args.length != 0) {
		for (arg in args) {
			if (args[arg].val.charAt(args[arg].val.length - 1) == ';') {
				args[arg].val = args[arg].val.substring(0, args[arg].val.length - 1);
			}

			if (args[arg].type == 'Variable Setting') {
				formatted.push(args[arg].name);
				defaults.push({name: args[arg].name, value: args[arg].val});
				continue;
			}

			formatted.push(args[arg].val);
		}

		a = formatted.join(', ');
	}

	var builder = '';

	if (defaults.length != 0) {
		for (item in defaults) {
			builder += 'if (' + defaults[item].name + ' == null || ' + defaults[item].name + ' == undefined) { ' + defaults[item].value + '; }\n';
		}
	}

	if (generateBody(body).trim() == ';') {
		return proto + '.prototype.' + name + ' = function (' + a + ') {' + builder + '};';
	} else {
		return proto + '.prototype.' + name + ' = function (' + a + ') {\n' + builder + generateBody(body) + '};';
	}
};

var IodeFunction = function(name, args, body) {
	this.type = 'Function';
	this.name = name;
	this.args = args;
	this.body = body;
	this.val = getIFValue(name, args, body);
	this.valAlt = getIFValueAlt(name, args, body);
};

var getIFValue = function(name, args, body) {
	var a = '';
	var formatted = [];
	var defaults = [];
	var checks = [];

	if (args.length != 0) {
		for (arg in args) {
			if (args[arg].it.val.charAt(args[arg].it.val.length - 1) == ';') {
				args[arg].it.val = args[arg].it.val.substring(0, args[arg].it.val.length - 1);
			}

			if (args[arg].it.type == 'Variable Setting') {
				formatted.push(args[arg].it.name);
				defaults.push({name: args[arg].it.name, value: args[arg].it.val});
				continue;
			}

			if (args[arg].expecting != null) {
				checks.push({name: args[arg].it.val, expecting: args[arg].expecting});
			}

			formatted.push(args[arg].it.val);
		}

		a = formatted.join(', ');
	}

	var builder = '';

	if (defaults.length != 0) {
		for (item in defaults) {
			builder += 'if (' + defaults[item].name + ' === null || ' + defaults[item].name + ' === undefined) { ' + defaults[item].name + ' = ' + defaults[item].value + '; }\n';
		}
	}

	if (checks.length != 0) {
		for (item in checks) {
			builder += 'if (!(typeof(' + checks[item].name + ') === \"' + checks[item].expecting + '\")) { throw \'Expected type of \"' + checks[item].expecting + '\" for var \"' + checks[item].name + '\"\'; }\n';
		}
	}

	if (generateBody(body).trim() == ';') {
		return 'function ' + name + '(' + a + ') {\ns' + builder + '};';
	} else {
		return 'function ' + name + '(' + a + ') {\n' + builder + generateBody(body) + '};';
	}
};

var getIFValueAlt = function(name, args, body) {
	var a = '';

	if (args.length != 0) {
		a = args.join(', ');
	}

	if (generateBody(body).trim() == ';') {
		return '.prototype.' + name + ' = function(' + a + ') { };';
	} else {
		return '.prototype.' + name + ' = function(' + a + ') {\n' + generateBody(body) + '};';
	}
};

var IodeArray = function(args) {
	this.type = 'Array';
	this.args = args;
	this.val = getIAValue(args);
};

var getIAValue = function(args) {
	var a = '';

	if (args.length != 0) {
		a = args.join(', ');
	}

	return '[' + a + ']';
};

var IodeRange = function(from, to) {
	this.type = 'Array Range';
	this.from = from;
	this.to = to;
	this.val = getIRangeValue(from, to);
};

var getIRangeValue = function(from, to) {
	return '[' + getNumbers(from.val + '..' + to.val) + ']';
};

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
};

var IodeCall = function(name, args) {
	this.type = 'Call';
	this.name = name;
	this.args = args;
	this.val = getICValue(name, args);
};

var getICValue = function(name, args) {
	var a = '';
	var b = '';

	if (args.length != 0) {
		a = args.join(', ');
	}

	return name + '(' + a + ');';
};

var IodeClass = function(name, constructor, body, extended) {
	this.type = 'Class';
	this.name = name;
	this.constructor = constructor;
	this.body = body;
	this.extended = extended;
	this.val = getIClassValue(name, constructor, body, extended);
};

var getIClassValue = function(name, constructor, body, extended) {
	var compile = '';
	var a = '';

	if (constructor.length != 0) {
		a = constructor.join(', ');
	}

	if (extended != null) {
		compile += 'function extend(target, source) {Object.getOwnPropertyNames(source).forEach(function(propName) {Object.defineProperty(target, propName,Object.getOwnPropertyDescriptor(source, propName));});return target;}';
		compile += '\n\n';
	}

	if (constructor == null || constructor.length == 0) {
		compile += 'var ' + name + ' = (function() {\n';

		for (f in body) {
			compile += f.valAlt;
		}
	} else {
		compile += 'var ' + name + ' = (function() {\n';
		compile += 'function ' + name + '('

		for (a in constructor) {
			compile += constructor[a] + ', ';
		}

		compile = compile.substring(0, compile.length - 2) + ') {';
		for (a in constructor) {
			compile += 'this.' + constructor[a] + ' = ' + constructor[a] + ';';
		}

		for (f in body) {
			if (body[f].valAlt == undefined) {
				compile += body[f].val;
			}
		}

		compile += '\n}';

		for (f in body) {
			if (body[f].valAlt != undefined) {
				compile += (name + body[f].valAlt);
			}
		}
	}

	compile += '\nreturn ' + name + ';\n})();';

	if (extended != null) {
		compile += '\n\nextend(' + name + '.prototype, ' + extended + '.prototype);';
	}

	return compile;
};

var IodeNamespace = function(name, body) {
	this.type = 'IodeNamespace';
	this.name = name;
	this.body = body;
	this.val = getINamespaceValue(name, body);
};

var getINamespaceValue = function(name, body) {
	var compile = 'var ' + name + ';\n(function(' + name + ') {\n';
	var names = [];

	for (f in body) {
		names.push(body[f].name);

		if (body[f].valAlt != undefined) {
			compile += body[f].valAlt;
		} else {
			compile += body[f].val;
		}
	}

	for (n in names) {
		compile += '\n' + name + '.' + names[n] + ' = ' + names[n] + ';';
	}

	compile += '\n})(' + name + ' || (' + name + ' = {}));';

	return compile;
};

var IodeCallList = function(calls) {
	this.type = 'Call List';
	this.calls = calls;
	this.val = getICLValue(calls);
};

var getICLValue = function(calls) {
	var out = '';

	calls = calls.map(function(call) {
		if (call.charAt(call.length - 1) == ';') {
			return call.substring(0, call.length - 1);
		} else {
			return call;
		}
	});

	if (calls.length != 0) {
		out = calls.join('.');
	}

	if (out.charAt(out.length - 1) == ';') {
		return out;
	} else {
		return out + ';';
	}

	return out;
};

var IodeIdentNotary = function(ident, expr1, expr2) {
	this.type = 'Ternary Notation';
	this.ident = ident;
	this.expr1 = expr1;
	this.expr2 = expr2;
	this.val = getIINValue(ident, expr1, expr2);
}

var getIINValue = function(ident, expr1, expr2) {
	if (ident.val.charAt(ident.val.length - 1) == ';') {
		ident.val = ident.val.substring(0, ident.val.length - 1);
	}

	return ident.val + ' ? ' + expr1.val + ' : ' + expr2.val;
};

var IodeArrayIndex = function(ident, index) {
	this.type = 'Array Index';
	this.ident = ident;
	this.index = index;
	this.val = getIAIValue(ident, index);
}

var getIAIValue = function(ident, index) {
	if (ident.val.charAt(ident.val.length - 1) == ';') {
		ident.val = ident.val.substring(0, ident.val.length - 1);
	}

	return ident.val + '[' + index.val + ']';
};

var IodeTry = function(body, catchArgs, catchBody) {
	this.type = 'Try';
	this.body = body;
	this.catchArgs = catchArgs;
	this.catchBody = catchBody;
	this.val = getITryValue(body, catchArgs, catchBody);
};

var getITryValue = function(body, catchArgs, catchBody) {
	return 'try {\n' + generateBody(body) + '} catch (' + catchArgs + ') {\n ' + generateBody(catchBody) + '}';
};

var IodeWhile = function(args, body) {
	this.type = 'While';
	this.args = args;
	this.body = body;
	this.val = getIWValue(args, body);
};

var getIWValue = function(args, body) {
	return 'while (' + args.val + ') {\n' + generateBody(body) + '}';
};

var IodeRepeat = function(args, body) {
	this.type = 'Repeat';
	this.args = args;
	this.body = body;
	this.val = getIRepeatValue(args, body);
};

var getIRepeatValue = function(args, body) {
	return 'for (var _i = 1; _i <= ' + args.val + '; _i++) {\n' + generateBody(body) + '}';
};

var IodeIf = function(args, body) {
	this.type = 'If';
	this.args = args;
	this.body = body;
	this.val = getIIFValue(args, body);
};

var getIIFValue = function(args, body) {
	return 'if (' + args.val + ') {\n' + generateBody(body) + '}';
};

var IodeElsIf = function(args, body) {
	this.type = 'ElsIf';
	this.args = args;
	this.body = body;
	this.val = getIEIFValue(args, body);
};

var getIEIFValue = function(args, body) {
	return 'else if (' + args.val + ') {\n' + generateBody(body) + '}';
};

var IodeElse = function(body) {
	this.type = 'Else';
	this.body = body;
	this.val = getIELValue(body);
};

var getIELValue = function(body) {
	return 'else {\n' + generateBody(body) + '}';
};

var IodeIfChain = function(chains) {
	this.type = 'If';
	this.chains = chains;
	this.val = getIIFCValue(chains);
};

var getIIFCValue = function(chains) {
	chains = chains.map(function(chain) {
		return chain.val;
	});

	return chains.join(' ');
};

var IodeUntil = function(args, body) {
	this.type = 'Until';
	this.args = args;
	this.body = body;
	this.val = getIUValue(args, body);
};

var getIUValue = function(args, body) {
	return 'while (!(' + args.val + ')) {\n' + generateBody(body) + '}';
};

var IodeForeach = function(val, arr, body) {
	this.type = 'Foreach';
	this.val = val;
	this.arr = arr;
	this.val = getIFOREValue(val, arr, body);
};

var getIFOREValue = function(val, arr, body) {
	return 'for (' + val.val + ' in ' + arr.val + ') {\n' + generateBody(body) +
		'}';
};

var IodeConstant = function(name, value) {
	this.type = 'Constant Variable Declaration';
	this.name = name;
	this.value = value;
	this.val = getIConstValue(name, value.val);
};

var getIConstValue = function(name, value) {
	var output =
		'Object.defineProperty(typeof global === \'object\' ? global : window, \'' +
		name + '\',{value:' + value +
		',enumerable:true,writable:false,configurable: false})';

	if (value.charAt(value.length - 1) == ';') {
		return output;
	} else {
		return output + ';';
	}
};

var IodeReturn = function(value) {
	this.value = value;
	this.val = getIRValue(value);
};

var getIRValue = function(value) {
	if (value == null) {
		return 'return;';
	} else {
		if (value.val.charAt(value.val.length - 1) == ';') {
			return 'return ' + value.val;
		} else {
			return 'return ' + value.val + ';';
		}
	}
};

var IodeContinue = function(value) {
	this.value = value;
	this.val = getIContValue(value);
};

var getIContValue = function(value) {
	if (value == null) {
		return 'continue;';
	} else {
		if (value.val.charAt(value.val.length - 1) == ';') {
			return 'continue ' + value.val;
		} else {
			return 'continue ' + value.val + ';';
		}
	}
};

var IodeThrow = function(value) {
	this.value = value;
	this.val = getIThrowValue(value);
};

var getIThrowValue = function(value) {
	if (value.val.charAt(value.val.length - 1) == ';') {
		return 'throw ' + value.val;
	} else {
		return 'throw ' + value.val + ';';
	}
};

var IodeNew = function(obj) {
	this.type = 'New';
	this.obj = obj;
	this.val = getINewValue(obj);
};

var getINewValue = function(obj) {
	return 'new ' + obj.val;
};

var IodeInclude = function(value) {
	this.type = 'Include';
	this.value = value;
	this.val = value;
};

var IodeNot = function(value) {
	this.type = 'Not';
	this.value = value;
	this.val = '!' + value.val;
};

var IodeMassVariableDeclaration = function(names, values) {
	this.type = 'Mass Variable Declaration';
	this.names = names;
	this.values = values;
	this.val = getIMVDValue(names, values);
};

var getIMVDValue = function(names, values) {
	var str = '';

	for (name in names.args) {
		str += 'var ' + names.args[name] + ' = ' + values.args[name] + ';\n';
	}

	return str;
};

var IodeEmptyMassVariable = function(names) {
	this.type = 'Mass Variable Declaration';
	this.names = names;
	this.val = getIEMValue(names);
};

var getIEMValue = function(names) {
	var str = '';

	for (name in names.args) {
		str += 'var ' + names.args[name] + ';\n';
	}

	return str;
};

var IodeMassVariableSetting = function(names, values) {
	this.type = 'Mass Variable Setting';
	this.names = names;
	this.values = values;
	this.val = getIMVSValue(names, values);
};

var getIMVSValue = function(names, values) {
	var str = '';

	for (name in names.args) {
		str += names.args[name] + ' = ' + values.args[name] + ';\n';
	}

	return str;
};

var IodeFor = function(name, val, cond, iter, body) {
	this.type = 'For';
	this.name = name;
	this.val = val;
	this.cond = cond;
	this.iter = iter;
	this.body = body;
	this.val = getIForValue(name, val, cond, iter, body);
};

var getIForValue = function(name, val, cond, iter, body) {
	return 'for (var ' + name + ' = ' + val.val + '; '
		+ cond.val + '; ' + iter.val + ') {\n' + generateBody(body) + '\n}';
};

var IodeNumberPlusMinus = function(num, op) {
	this.type = 'Number Append/Depend';
	this.num = num;
	this.op = op;
	this.val = num.val + op;
};

var IodeEmptyVariable = function(name) {
	this.type = 'Variable Declaration';
	this.name = name;
	this.val = 'var ' + name + ';';
};

var IodePattern = function(pattern) {
	this.type = 'Pattern';
	this.pattern = pattern;
	this.val = getIPatternValue(pattern);
};

var getIPatternValue = function(pattern) {
	return pattern;
};

var IodeJSON = function(elements) {
	this.type = 'JSON';
	this.elements = elements;
	this.val = getIJSONValue(elements);
};

var getIJSONValue = function(elements) {
	var builder = '{';

	for (element in elements) {
		builder += '\n' + elements[element].left + ':' + elements[element].right + ',';
	}

	builder = builder.substring(0, builder.length - 1) + '}';

	return builder;
};

var IodeEmbedded = function(js) {
	this.type = 'Embedded JavaScript';
	this.js = js;
	this.val = js;
};

var IodeNewline = function() {
	this.type = 'Newline';
	this.val = '';
};

exports.IodeIdentifier = IodeIdentifier;
exports.IodeNumber = IodeNumber;
exports.IodeString = IodeString;
exports.IodeBoolean = IodeBoolean;
exports.IodeBinaryOp = IodeBinaryOp;
exports.IodeVariableDeclaration = IodeVariableDeclaration;
exports.IodeVariableSetting = IodeVariableSetting;
exports.IodeFunction = IodeFunction;
exports.IodeParenthesis = IodeParenthesis;
exports.IodeCall = IodeCall;
exports.IodeCallList = IodeCallList;
exports.IodeNewline = IodeNewline;
exports.IodeNew = IodeNew;
exports.IodeWhile = IodeWhile;
exports.IodeUntil = IodeUntil;
exports.IodeIf = IodeIf;
exports.IodeElsIf = IodeElsIf;
exports.IodeElse = IodeElse;
exports.IodeIfChain = IodeIfChain;
exports.IodeNot = IodeNot;
exports.IodeForeach = IodeForeach;
exports.IodeConstant = IodeConstant;
exports.IodeReturn = IodeReturn;
exports.IodeContinue = IodeContinue;
exports.IodeThrow = IodeThrow;
exports.IodeInclude = IodeInclude;
exports.IodeIdentNotary = IodeIdentNotary;
exports.IodeArray = IodeArray;
exports.IodeArrayIndex = IodeArrayIndex;
exports.IodeRange = IodeRange;
exports.IodeMassVariableDeclaration = IodeMassVariableDeclaration;
exports.IodeMassVariableSetting = IodeMassVariableSetting;
exports.IodeFor = IodeFor;
exports.IodeNumberPlusMinus = IodeNumberPlusMinus;
exports.IodeEmptyVariable = IodeEmptyVariable;
exports.IodeEmptyMassVariable = IodeEmptyMassVariable;
exports.IodePercentage = IodePercentage;
exports.IodeClass = IodeClass;
exports.IodeRepeat = IodeRepeat;
exports.IodePattern = IodePattern;
exports.IodeJSON = IodeJSON;
exports.IodeNamespace = IodeNamespace;
exports.IodeTry = IodeTry;
exports.IodeEmbedded = IodeEmbedded;
exports.IodePrototype = IodePrototype;
