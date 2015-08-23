%lex
%%

\"(.*)?\" { return 'STRING'; }
\'(.*)?\' { return 'SINGLESTRING'; }
"using"  { return 'USING'; }
"yes"  { return 'YES'; }
"no"  { return 'NO'; }
"nothing"  { return 'NOTHING'; }
"null"  { return 'NOTHING'; }
"unknown"  { return 'UNKNOWN'; }
"undefined"  { return 'UNKNOWN'; }
"true"  { return 'YES'; }
"false"  { return 'NO'; }
"if"   { return 'IF'; }
"else" { return 'ELSE'; }
"elsif" { return 'ELSIF'; }
"unless"   { return 'UNLESS'; }
"while"   { return 'WHILE'; }
"for"  { return 'FOR'; }
"fn"   { return 'FN'; }
"new"  { return 'NEW'; }
"end"  { return 'END'; }
"let"  { return 'LET'; }
"final"  { return 'FINAL'; }
"class"  { return 'CLASS'; }
"extends"  { return 'EXTENDS'; }
"try"  { return 'TRY'; }
"catch" { return 'CATCH'; }
"case" { return 'CASE'; }
"of" { return 'OF'; }
"default" { return 'DEFAULT'; }
"repeat" { return 'REPEAT'; }
"export" { return 'EXPORT'; }
"do" { return 'DO'; }
"is" { return 'IS'; }
"be" { return 'BE'; }
"in" { return 'IN'; }
"has" { return 'HAS'; }
"isnt" { return 'ISNT'; }
"not" { return 'NOT'; }
"or" { return '||'; }
"and" { return '&&'; }
"when"  { return 'WHEN'; }
"to"  { return 'TO'; }
"until"  { return 'UNTIL'; }
"where"  { return 'WHERE'; }
"instanceof"  { return '~='; }
"..."  { return '...'; }
".."  { return '..'; }
">>>" { return '>>>'; }
"<<<" { return '<<<'; }
"=>"    { return '=>'; }
"->"    { return '->'; }
"<-"    { return '<-'; }
[0-9]+('.'[_0-9]+)?('%') { return 'PERCENT'; }
[0-9]+('.'[_0-9]+)? { return 'NUMBER'; }
0[xX][0-9a-fA-F]+ { return 'NUMBER'; }
[A-Za-z_$][A-Za-z0-9_$]* { return 'IDENT'; }
[A-Za-z_$] { return 'IDENT'; }
([\#]([^\\#]*)?[\#]) { return 'COMMENT'; }
\/((?![*+?])(?:[^\r\n\[/\\]|\\.|\[(?:[^\r\n\]\\]|\\.)*\])+)\/((?:g(?:im?|m)?|i(?:gm?|m)?|m(?:gi?|i)?)?) { return 'REGEX'; }
\s+    { /* whitespace-insignificant */ }
"||"    { return '||'; }
"&&"    { return '&&'; }
"#"    { return '#'; }
":"    { return ':'; }
"."    { return '.'; }
"+="    { return '+='; }
"-="    { return '-='; }
"++"    { return '++'; }
"--"    { return '--'; }
"("    { return '('; }
")"    { return ')';  }
"{"    { return '{'; }
"}"    { return '}'; }
"["    { return '['; }
"]"    { return ']'; }
"~="   { return '~='; }
"?="   { return '?='; }
"=="   { return '=='; }
">="   { return '>='; }
"<="   { return '<='; }
">"   { return '>'; }
"<"   { return '<'; }
"!"   { return '!'; }
"!="   { return '!='; }
"/="   { return '!='; }
"+"    { return '+'; }
"-"    { return '-'; }
'*'    { return '*'; }
"/"    { return '/'; }
"%"    { return '%'; }
"="    { return '='; }
','    { return ','; }
";"    { return ';'; }
"?"    { return '?'; }
"@"    { return '@'; }
"^"    { return '^'; }
"@"    { return '@'; }
<<EOF>> { return 'EOF'; }

/lex

%left '...'
%left '..'
%left '?'
%left '<<<'
%left '=>'
%left '->'
%left '<-'
%left '+'
%left '-'
%left '*'
%left '/'
%left '%'
%left '~='
%left '?='
%left '=='
%left IS
%left ISNT
%left NOT
%left WHEN
%left IN
%left TO
%left OF
%left HAS
%left '!'
%left '!='
%left '>='
%left '<='
%left '>'
%left '<'
%left '+='
%left '-='
%left '++'
%left '--'
%left ':'
%left '^'
%left '@'
%left '||'
%left '&&'

%%

program
  : StatementList EOF
    {{ return ['Stripes', {}].concat($1); }}
  | EOF
    {{ return ['EOF']; }}
  ;

StatementList
  : Statement ';'
    {{ $$ = [$1]; }}
  | StatementList Statement ';'
    {{ $1.push($2); $$ = $1; }}
  ;

Block
  : StatementList END
  | END
  ;

Statement
  : SetVar
  | Try
  | WHERE IDENT ConditionList
    {{ $$ = ["Where", $3, $2]; }}
  | WHERE ConditionList
    {{ $$ = ["WhereUnnamed", $2]; }}
  | IF ConditionList Block
    {{ $$ = ['If', $2, $3]; }}
  | ELSIF ConditionList Block
    {{ $$ = ['Elsif', $2, $3]; }}
  | ELSE Block
    {{ $$ = ['Else', $2]; }}
  | DO Block WHILE ConditionList
    {{ $$ = ['DoWhile', $2, $4]; }}
  | DO Block UNTIL ConditionList
    {{ $$ = ['DoUntil', $2, $4]; }}
  | DO Block
    {{ $$ = ['Do', $2]; }}
  | UNLESS ConditionList Block
    {{ $$ = ['Unless', $2, $3]; }}
  | WHILE ConditionList Block
    {{ $$ = ['While', $2, $3]; }}
  | UNTIL ConditionList Block
    {{ $$ = ['Until', $2, $3]; }}
  | FOR '(' SetVar ';' Expr ';' Expr ')' Block
    {{ $$ = ['For', $3, $5, $7, $9]; }}
  | FOR '(' IDENT IN Expr ')' Block
    {{ $$ = ['ForEach', $3, $5, $7]; }}
  | FOR '(' IDENT ',' IDENT ':' Expr ')' Block
    {{ $$ = ['ForKeyVal', $3, $5, $7, $9]; }}
  | CLASS IDENT ArgumentList ClassElements END
    {{ $$ = ['Class', $2, $3, $4]; }}
  | CLASS IDENT ArgumentList END
    {{ $$ = ['Class', $2, $3, "end"]; }}
  | COMMENT
    {{ $$ = ['Comment', yytext]; }}
  | IDENT '<<<' ArgumentList OF Expr
    {{ $$ = ['AssignFromObject', $1, $5, $3]; }}
  | Case
  | REPEAT '(' Expr ':' Expr ')' Block
    {{ $$ = ['Repeat', $3, $5, $7]; }}
  | CallArrayStmt
  | CallArrayStmt '+=' Expr
    {{ $$ = ['PlusEq', $1, $3]; }}
  | CallArrayStmt '-=' Expr
    {{ $$ = ['MinusEq', $1, $3]; }}
  | CallArrayStmt '<-' Expr
    {{ $$ = ['PushArray', $1, $3]; }}
  | Pointer '+=' Expr
    {{ $$ = ['PointerPlusEq', $1, $3]; }}
  | Pointer '-=' Expr
    {{ $$ = ['PointerMinusEq', $1, $3]; }}
  | Pointer '<-' Expr
    {{ $$ = ['PointerPushArray', $1, $3]; }}
  | JSON
  | FN IDENT ArgumentList Block
    {{ $$ = ['PrivateFunction', $2, $3, $4]; }}
  | FN IDENT '>>>' IDENT ArgumentList Block
    {{ $$ = ['Prototype', $2, $4, $5, $6]; }}
  | CallArrayStmt IF ConditionList
    {{ $$ = ["CallIf", $1, $3]; }}
  | CallArrayStmt UNLESS ConditionList
    {{ $$ = ["CallUnless", $1, $3]; }}
  | CallArrayStmt WHILE ConditionList
    {{ $$ = ["CallWhile", $1, $3]; }}
  | CallArrayStmt UNTIL ConditionList
    {{ $$ = ["CallUntil", $1, $3]; }}
  | SetVar IF ConditionList
    {{ $$ = ["SetIf", $1, $3]; }}
  | SetVar UNLESS ConditionList
    {{ $$ = ["SetUnless", $1, $3]; }}
  | ':' Expr
    {{ $$ = ["RunExpr", $2]; }}
  | USING IDENT
    {{ $$ = ["Using", $2]; }}
  ;

Case
  : CASE Expr OF CaseList
    {{ $$ = ['Case', $2, $4]; }}
  ;

CaseList
  : CaseElements
     {{ $$  = ['CaseL', $1]; }}
  ;

CaseElements
  : CaseElements "," CaseElement
     {{ $$ = ['CaseList', $1, $3]; }}
  | CaseElement
  ;

CaseElement
  : DEFAULT '->' Block
    {{ $$ = ['DefaultCaseElement', $3]; }}
  | Commas '->' Block
    {{ $$ = ['CaseElement', $1, $3]; }}
  ;

Try
  : TRY Block Catch
    {{ $$ = ['Try', $2, $3]; }}
  ;

Catch
  : CATCH '(' Expr ')' Block
    {{ $$ = ['Catch', $3, $5]; }}
  ;

SetVar
  : LET IDENT '=' Expr
    {{ $$ = ['DecVar', $2, $4]; }}
  | LET IDENT BE Expr
    {{ $$ = ['DecVar', $2, $4]; }}
  | FINAL IDENT '=' Expr
    {{ $$ = ['FinalVar', $2, $4]; }}
  | CallArrayVar Expr
    {{ $$ = ['SetVarCall', $1, $2]; }}
  | LET Pointer '=' Expr
    {{ $$ = ['ReferableVar', $2, $4]; }}
  | LET Pointer BE Expr
    {{ $$ = ['ReferableVar', $2, $4]; }}
  | Index '=' Expr
    {{ $$ = ['IndexSetVar', $1, $3]; }}
  | LET IDENT IS Expr
    {{ $$ = ['DecVar', $2, $4]; }}
  | FINAL IDENT IS Expr
    {{ $$ = ['FinalVar', $2, $4]; }}
  | IDENT IS Expr
    {{ $$ = ['SetVar', $1, $3]; }}
  | Index IS Expr
    {{ $$ = ['IndexSetVar', $1, $3]; }}
  | LET IDENT
    {{ $$ = ['DecVarEmpty', $2]; }}
  | FINAL IDENT
    {{ $$ = ['FinalVarEmpty', $2]; }}
  | ArgumentList '=' ArgumentList
    {{ $$ = ['ArraySet', $1, $3]; }}
  | LET ArgumentList '=' ArgumentList
    {{ $$ = ['ArrayLet', $2, $4]; }}
  | LET ArgumentList BE ArgumentList
    {{ $$ = ['ArrayLet', $2, $4]; }}
  | LET ArgumentList
    {{ $$ = ['ArrayLetEmpty', $2]; }}
  | FINAL ArgumentList '=' ArgumentList
    {{ $$ = ['ArrayFinal', $2, $4]; }}
  | ArgumentList IS ArgumentList
    {{ $$ = ['ArraySet', $1, $3]; }}
  | LET ArgumentList IS ArgumentList
    {{ $$ = ['ArrayLet', $2, $4]; }}
  | FINAL ArgumentList IS ArgumentList
    {{ $$ = ['ArrayFinal', $2, $4]; }}
  | EXPORT ArgumentList
    {{ $$ = ['Export', $2]; }}
  | '(' Expr '||' Expr ')' '=' Expr
    {{ $$ = ["SetOr", $2, $4, $7]; }}
  | '(' Expr '||' Expr ')' IS Expr
    {{ $$ = ["SetOr", $2, $4, $7]; }}
  | '++' Expr
    {{ $$ = ['Plus', $2]; }}
  | '--' Expr
    {{ $$ = ['Minus', $2]; }}
  | SetVarType
  | DEFAULT Expr '=' Expr
    {{ $$ = ["DefaultVar", $2, $4]; }}
  | DEFAULT Expr IS Expr
    {{ $$ = ["DefaultVar", $2, $4]; }}
  ;

SetVarType
  : IDENT IDENT '=' Expr
    {{ $$ = ['SetVarType', $1, $2, $4]; }}
  | LET IDENT IDENT '=' Expr
    {{ $$ = ['DecVarType', $2, $3, $5]; }}
  | FINAL IDENT IDENT '=' Expr
    {{ $$ = ['FinalVarType', $2, $3, $5]; }}
  ;

Pointer
  : '@' IDENT
    {{ $$ = ['Pointer', $2]; }}
  ;

String
  : STRING
    {{ $$ = ['String', yytext]; }}
  | SINGLESTRING
    {{ $$ = ['SingleString', yytext]; }}
  ;

Expr
  : Index
  | Pointer
  | NUMBER
    {{ $$ = ['Number', yytext]; }}
  | '-' NUMBER
    {{ $$ = ['Number', "-" + yytext]; }}
  | YES
    {{ $$ = ['Yes']; }}
  | NO
    {{ $$ = ['No']; }}
  | NOTHING
    {{ $$ = ['Nothing']; }}
  | UNKNOWN
    {{ $$ = ['Unknown']; }}
  | PERCENT
    {{ $$ = ['Percent', yytext]; }}
  | String
  | Array
  | ArgumentList
  | JSON
  | EXTENDS IDENT
    {{ $$ = ['Extends', $2]; }}
  | NEW IDENT
    {{ $$ = ['New', $2, ['EmptyArgs']]; }}
  | NEW IDENT ArgumentList
    {{ $$ = ['New', $2, $3]; }}
  | FN ArgumentList Block
    {{ $$ = ['Function', $2, $3]; }}
  | FN Block
    {{ $$ = ['Function', ['EmptyArgs'], $2]; }}
  | REGEX
    {{ $$ = ['Regex', yytext]; }}
  | '@' '?' Expr TO Expr
    {{ $$ = ['RandomOp', $3, $5]; }}
  | '@' '?'
    {{ $$ = ['RandomGen']; }}
  | CallArray
  | ArgumentList '=>' Expr
    {{ $$ = ['ArrowFunction', $1, $3]; }}
  | '=>' Expr
    {{ $$ = ['ArrowFunction', ['EmptyArgs'], $2]; }}
  | Expr WHEN Expr '||' Expr
    {{ $$ = ['ConditionCheckOr', $1, $3, $5]; }}
  | Expr '++'
    {{ $$ = ['Plus', $1]; }}
  | Expr '--'
    {{ $$ = ['Minus', $1]; }}
  | Expr '+' Expr
    {{ $$ = ['Add', $1, $3]; }}
  | Expr '-' Expr
    {{ $$ = ['Sub', $1, $3]; }}
  | Expr '*' Expr
    {{ $$ = ['Mul', $1, $3]; }}
  | Expr '/' Expr
    {{ $$ = ['Div', $1, $3]; }}
  | Expr '%' Expr
    {{ $$ = ['Mod', $1, $3]; }}
  | Expr '^' Expr
    {{ $$ = ['Expo', $1, $3]; }}
  | Expr IS Expr
    {{ $$ = ['Condition', $1, '===', $3]; }}
  | Expr ISNT Expr
    {{ $$ = ['Condition', $1, '!==', $3]; }}
  | Expr '~=' Expr
    {{ $$ = ['InstanceCondition', $1, $3]; }}
  | Expr '?=' Expr
    {{ $$ = ['TypeCondition', $1, $3]; }}
  | Expr '==' Expr
    {{ $$ = ['Condition', $1, '===', $3]; }}
  | Expr '>' Expr
    {{ $$ = ['Condition', $1, $2, $3]; }}
  | Expr '<' Expr
    {{ $$ = ['Condition', $1, $2, $3]; }}
  | Expr '>=' Expr
    {{ $$ = ['Condition', $1, $2, $3]; }}
  | Expr '<=' Expr
    {{ $$ = ['Condition', $1, $2, $3]; }}
  | Expr '!=' Expr
    {{ $$ = ['Condition', $1, '!==', $3]; }}
  | Expr HAS Expr
    {{ $$ = ['HasArray', $3, $1]; }}
  | Expr IN Expr
    {{ $$ = ['InArray', $1, $3]; }}
  | '!' Expr
    {{ $$ = ['ConditionNot', $2]; }}
  | NOT Expr
    {{ $$ = ['ConditionNot', $2]; }}
  | Expr '?'
    {{ $$ = ['ConditionCheck', $1]; }}
  | Expr '...' Expr
    {{ $$ = ['LessRange', $1, $3]; }}
  | Expr '..' Expr
    {{ $$ = ['Range', $1, $3]; }}
  ;

ArgumentList
  : '(' ArgElement ')'
     {{ $$  = ['ArgumentList', $2]; }}
  | '(' ')'
    {{ $$ = ['EmptyArgs']; }}
  ;

ArgElement
  : ArgElement "," Expr
     {{ $$ = ['ArgElement', $1, $3]; }}
  | Expr
  ;

ConditionList
  : '(' CondElement ')'
     {{ $$  = ['ConditionList', $2]; }}
  | '(' ')'
    {{ $$ = ['EmptyArgs']; }}
  ;

CondElement
  : CondElement '&&' Expr
     {{ $$ = ['CondAndElement', $1, $3]; }}
  | CondElement '||' Expr
     {{ $$ = ['CondOrElement', $1, $3]; }}
  | Expr
  ;

Array
  : '[' ArrayElement ']'
     {{ $$  = ['Array', $2]; }}
  | '[' ']'
     {{ $$ = ['EmptyArray']; }}
  ;

ArrayElement
  : ArrayElement "," Expr
     {{ $$ = ['ArrayElement', $1, $3]; }}
  | Expr
  ;

Commas
  : CommaElement
     {{ $$  = ['Commas', $1]; }}
  ;

CommaElement
  : CommaElement "," Expr
     {{ $$ = ['CommaElement', $1, $3]; }}
  | Expr
  ;

Call
  : IDENT ArgumentList
    {{ $$ = ['CallExpr', $1, $2]; }}
  | IDENT
    {{ $$ = ['CallExprNoArgs', $1]; }}
  ;

CallArray
  : CallElement
    {{ $$  = ['CallArray', $1]; }}
  ;

CallArrayVar
  : CallElement '='
    {{ $$  = ['CallArray', $1]; }}
  ;

CallArrayStmt
  : CallElement
    {{ $$  = ['CallArrayStmt', $1]; }}
  ;

CallElement
  : CallElement "." Call
     {{ $$ = ['CallElement', $1, $3]; }}
  | Call
  ;

Index
  : CallElement Array '.' CallElement
    {{ $$ = ['IndexCall', $1, $2, $4]; }}
  | CallElement Array
    {{ $$ = ['Index', $1, $2]; }}
  ;

JSON
  : '{' JSONElement '}'
     {{ $$  = ['JSON', $2]; }}
  | '{' '}'
     {{ $$ = ['EmptyJSON']; }}
  ;

JSONElement
  : JSONElement "," Elements
     {{ $$ = ['JSONList', $1, $3]; }}
  | Elements
  ;

ClassElements
  : ClassElements "," ClassElement
     {{ $$ = ['ClassList', $1, $3]; }}
  | ClassElement
  ;

ClassElement
  : Expr '->' Expr
    {{ $$ = ['ClassElement', $1, $3]; }}
  ;

Elements
  : Expr '->' Expr
    {{ $$ = ['Element', $1, $3]; }}
  ;
