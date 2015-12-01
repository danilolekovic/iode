var Token = require('./token').Token,
	TokenType = require('./token').TokenType;

var Lexer = function(code) {
	this.code = code;
	this.index = -1;
	this.tokens = [];
	this.line = 1;

	this.peekToken = function() {
		return this.tokens[this.index + 1];
	};

	this.peekSpecificToken = function(i) {
		return this.tokens[this.index + i];
	};

	this.nextToken = function() {
		this.index++;
		return this.tokens[this.index];
	};

	this.isLetter = function(char) {
		return ((char >= 65) && (char <= 90)) || ((char >= 97) && (char <= 122)) ||
			char == 36 || char == 95;
	};

	this.isNumber = function(char) {
		return char >= 48 && char <= 57;
	};

	this.isNumberUnder = function(char) {
		return char >= 48 && char <= 57 || char == 95;
	};

	this.isLetterOrNumber = function(char) {
		return this.isLetter(char) || this.isNumber(char);
	};

	this.isSymbol = function(char) {
		return char == 33 || (char >= 37 && char <= 38) || (char >= 40 && char <=
			47) || char == 58 || (char >= 60 && char <= 62) || (char >= 123 && char <=
			125) || char == 35 || char == 63 || char == 91 || char == 93;
	};

	this.isQuote = function(char) {
		return char == 34;
	};

	this.isNewLine = function(char) {
		return char == 10;
	};

	this.isWhiteSpace = function(char) {
		return char == 32 || char == 9 || char == 11;
	};

	this.error = function(msg) {
		console.log();
		console.log('[x] ' + msg + ' on line #' + this.line + '.');
		console.log();
		process.exit(1);
	};

	this.tokenize = function() {
		var pos = 0;
		var code = this.code;
		var output = [];

		while (pos < code.length) {
			var str = '';

			if (this.isLetter(code.charCodeAt(pos))) {
				str = code[pos];
				pos++;

				while (this.isLetterOrNumber(code.charCodeAt(pos))) {
					str += code[pos];
					pos++;
				}

				if (str == 'true' || str == 'false' || str == 'nil' || str == 'undefined') {
					output.push(new Token(TokenType.BOOLEAN, str));
				} else if (str == 'var') {
					output.push(new Token(TokenType.VAR, str));
				} else if (str == 'fn') {
					output.push(new Token(TokenType.FUNCTION, str));
				} else if (str == 'while') {
					output.push(new Token(TokenType.WHILE, str));
				} else if (str == 'until') {
					output.push(new Token(TokenType.UNTIL, str));
				} else if (str == 'else') {
					output.push(new Token(TokenType.ELSE, str));
				} else if (str == 'elsif') {
					output.push(new Token(TokenType.ELSIF, str));
				} else if (str == 'if') {
					output.push(new Token(TokenType.IF, str));
				} else if (str == 'new') {
					output.push(new Token(TokenType.NEW, str));
				} else if (str == 'foreach') {
					output.push(new Token(TokenType.FOREACH, str));
				} else if (str == 'in') {
					output.push(new Token(TokenType.IN, str));
				} else if (str == 'const') {
					output.push(new Token(TokenType.CONST, str));
				} else if (str == 'return') {
					output.push(new Token(TokenType.RETURN, str));
				} else if (str == 'continue') {
					output.push(new Token(TokenType.CONTINUE, str));
				} else if (str == 'throw') {
					output.push(new Token(TokenType.THROW, str));
				} else if (str == 'include') {
					output.push(new Token(TokenType.INCLUDE, str));
				} else if (str == 'for') {
					output.push(new Token(TokenType.FOR, str));
				} else if (str == 'class') {
					output.push(new Token(TokenType.CLASS, str));
				} else if (str == 'repeat') {
					output.push(new Token(TokenType.REPEAT, str));
				} else if (str == 'namespace') {
					output.push(new Token(TokenType.NAMESPACE, str));
				} else {
					output.push(new Token(TokenType.IDENTIFIER, str));
				}

				str = '';
			} else if (this.isQuote(code.charCodeAt(pos))) {
				pos++;
				str = '';

				while (!this.isQuote(code.charCodeAt(pos))) {
					str += code[pos];
					pos++;
				}

				output.push(new Token(TokenType.STRING, str));
				pos++;
				str = '';
			} else if (this.isNumber(code.charCodeAt(pos))) {
				str = code[pos];
				pos++;

				while (this.isNumberUnder(code.charCodeAt(pos)) || code[pos] == '.') {
					if (code[pos] == '.' && code[pos + 1] == '.') {
						break;
					} else {
						str += code[pos];
						pos++;
					}
				}

				if (str.charAt(str.length - 1) == '.') {
					this.error('Float/decimal cannot end with a decimal');
				}

				output.push(new Token(TokenType.NUMBER, str));

				str = '';
			} else if (this.isSymbol(code.charCodeAt(pos))) {
				switch (code[pos]) {
					case '!':
						pos++;

						if (code[pos] == '=') {
							output.push(new Token(TokenType.NEQUALS, '!='));
							pos++;
						} else {
							output.push(new Token(TokenType.EXCLAMATION, '!'));
						}
						break;
					case '%':
						output.push(new Token(TokenType.PERCENT, '%'));
						pos++;
						break;
					case '&':
						pos++;

						if (code[pos] == '&') {
							output.push(new Token(TokenType.AND, '&&'));
							pos++;
						} else {
							this.error('Unknown symbol: \'' + code[pos] + '\'');
						}
						break;
					case '|':
						pos++;

						if (code[pos] == '|') {
							output.push(new Token(TokenType.OR, '||'));
							pos++;
						} else {
							this.error('Unknown symbol: \'' + code[pos] + '\'');
						}
						break;
					case '(':
						output.push(new Token(TokenType.LPAREN, '('));
						pos++;
						break;
					case ')':
						output.push(new Token(TokenType.RPAREN, ')'));
						pos++;
						break;
					case '*':
						pos++;

						if (code[pos] == '*') {
							pos++;
							output.push(new Token(TokenType.EXP, '**'));
						} else {
							output.push(new Token(TokenType.MUL, '*'));
						}
						break;
					case '+':
						pos++;

						if (code[pos] == '+') {
							pos++;
							output.push(new Token(TokenType.PLUSPLUS, '++'));
						} else if (code[pos] == '=') {
							pos++;
							output.push(new Token(TokenType.PLUSEQ, '+='));
						} else {
							pos++;
							output.push(new Token(TokenType.ADD, '+'));
						}
						break;
					case ',':
						output.push(new Token(TokenType.COMMA, ','));
						pos++;
						break;
					case '-':
						pos++;

						if (code[pos] == '-') {
							pos++;
							output.push(new Token(TokenType.SUBSUB, '--'));
						} else if (code[pos] == '=') {
							pos++;
							output.push(new Token(TokenType.SUBEQ, '-='));
						} else if (code[pos] == '>') {
							pos++;
							output.push(new Token(TokenType.ARROW, '->'));
						} else {
							pos++;
							output.push(new Token(TokenType.SUB, '-'));
						}
						break;
					case '.':
						pos++;

						if (code[pos] == '.') {
							pos++;
							output.push(new Token(TokenType.TWODOTS, '..'));
						} else {
							output.push(new Token(TokenType.DOT, '.'));
						}
						break;
					case '/':
						if (code[pos + 1] == '/' && code[pos + 2] == '/') {
							pos += 3;
							var regex = '/';

							while (code[pos] != '\n') {
								if (code[pos] == '/' && code[pos + 1] == '/' && code[pos + 2] == '/') {
									break;
								}

								regex += code[pos];
								pos++;
							}

							regex += '/';

							if (code[pos] == '/' && code[pos + 1] == '/' && code[pos + 2] == '/') {
								pos += 3;

								if (this.isLetter(code.charCodeAt(pos))) {
									regex += code[pos];
									pos++;
								}
							}

							output.push(new Token(TokenType.PATTERN, regex));
							output.push(new Token(TokenType.NEWLINE, '\n'));
						} else {
							output.push(new Token(TokenType.DIV, '/'));
							pos++;
						}
						break;
					case ':':
						output.push(new Token(TokenType.COLON, ':'));
						pos++;
						break;
					case '?':
						output.push(new Token(TokenType.QUESTION, '?'));
						pos++;
						break;
					case '[':
						output.push(new Token(TokenType.LBRACK, '['));
						pos++;
						break;
					case ']':
						output.push(new Token(TokenType.RBRACK, ']'));
						pos++;
						break;
					case '<':
						pos++;

						if (code[pos] == '=') {
							output.push(new Token(TokenType.LTEQUALS, '<='));
							pos++;
						} else {
							output.push(new Token(TokenType.LT, '<'));
						}
						break;
					case '=':
						pos++;

						if (code[pos] == '=') {
							pos++;

							output.push(new Token(TokenType.IS, '=='));
						} else {
							output.push(new Token(TokenType.EQUALS, '='));
						}
						break;
					case '>':
						pos++;

						if (code[pos] == '=') {
							output.push(new Token(TokenType.GTEQUALS, '>='));
							pos++;
						} else {
							output.push(new Token(TokenType.GT, '>'));
						}
						break;
					case '{':
						output.push(new Token(TokenType.LBRACE, '{'));
						pos++;
						break;
					case '}':
						output.push(new Token(TokenType.RBRACE, '}'));
						pos++;
						break;
					case '#':
						pos++;

						while (code[pos] != '#') {
							if (code[pos] == '\n') {
								this.error('Expected a \'#\' to end the comment');
							}

							pos++;
						}

						pos++;
						break;
					default:
						this.error('Unknown symbol: \'' + code[pos] + '\'');
						return;
				}
			} else if (this.isNewLine(code.charCodeAt(pos))) {
				output.push(new Token(TokenType.NEWLINE, '\n'));
				this.line++;
				pos++;
			} else if (this.isWhiteSpace(code.charCodeAt(pos)) || code.charCodeAt(pos) == 13) {
				pos++;
			} else {
				this.error('Unknown symbol: \'' + code[pos] + '\'');
			}
		}

		return output;
	};

	this.tokens = this.tokenize();
};

exports.Lexer = Lexer;
