%lex
%%

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
"do" { return 'DO'; }
"is" { return 'IS'; }
"in" { return 'IN'; }
"isnt" { return 'ISNT'; }
"not" { return 'NOT'; }
"or" { return 'OR_COND'; }
"and" { return 'AND_COND'; }
"when"  { return 'WHEN'; }
"to"  { return 'TO'; }
"yes"  { return 'YES'; }
"nothing"  { return 'NOTHING'; }
"no"  { return 'NO'; }
"..."  { return '...'; }
".."  { return '..'; }
">>>" { return '>>>'; }
"<<<" { return '<<<'; }
"->"    { return '->'; }
"<-"    { return '<-'; }
[_0-9]+('.'[_0-9]+)?('%') { return 'PERCENT'; }
[_0-9]+('.'[_0-9]+)? { return 'NUMBER'; }
0[xX][0-9a-fA-F]+ { return 'NUMBER'; }
[A-Za-z_$][.A-Za-z0-9_$]*[\\*] { return 'POINT'; }
[A-Za-z_$][.A-Za-z0-9_$]* { return 'IDENT'; }
([']([^\\']*)?[']) { return 'STRING'; }
([\"]([^\\"]*)?[\"]) { return 'STRING'; }
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
"=="   { return '=='; }
">="   { return '>='; }
"<="   { return '<='; }
">"   { return '>'; }
"<"   { return '<'; }
"!"   { return '!'; }
"!="   { return '!='; }
"+"    { return '+'; }
"-"    { return '-'; }
"*"    { return '*'; }
"/"    { return '/'; }
"%"    { return '%'; }
"="    { return '='; }
','    { return ','; }
";"    { return ';'; }
"?"    { return '?'; }
"@"    { return '@'; }
"^"    { return '^'; }
<<EOF>> { return 'EOF'; }

/lex

%left '...'
%left '..'
%left '?'
%left '<<<'
%left '->'
%left '<-'
%left '+'
%left '-'
%left '*'
%left '/'
%left '%'
%left '~='
%left '=='
%left IS
%left ISNT
%left AND_COND
%left OR_COND
%left NOT
%left WHEN
%left IN
%left TO
%left OF
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
  | IF ConditionList Block
    {{ $$ = ['If', $2, $3]; }}
  | ELSIF ConditionList Block
    {{ $$ = ['Elsif', $2, $3]; }}
  | ELSE Block
    {{ $$ = ['Else', $2]; }}
  | UNLESS ConditionList Block
    {{ $$ = ['Unless', $2, $3]; }}
  | WHILE ConditionList Block
    {{ $$ = ['While', $2, $3]; }}
  | FOR '(' SetVar ';' Expr ';' Expr ')' Block
    {{ $$ = ['For', $3, $5, $7, $9]; }}
  | FOR '(' IDENT ':' Expr ')' Block
    {{ $$ = ['ForEach', $3, $5, $7]}}
  | FOR '(' IDENT ',' IDENT ':' Expr ')' Block
    {{ $$ = ['ForKeyVal', $3, $5, $7, $9];}}
  | CLASS IDENT ArgumentList ClassElements END
    {{ $$ = ['Class', $2, $3, $4]; }}
  | COMMENT
    {{ $$ = ['Comment', yytext]; }}
  | IDENT '<<<' ArgumentList OF Expr
    {{ $$ = ['AssignFromObject', $1, $5, $3]; }}
  | Case
  | REPEAT '(' Expr OF Expr ')' Block
    {{ $$ = ['Repeat', $3, $5, $7]; }}
  | DO Block WHILE ConditionList
    {{ $$ = ['DoWhile', $2, $4]; }}
  | DO Block
    {{ $$ = ['Do', $2]; }}
  | CallArrayStmt
  | IDENT '+=' Expr
    {{ $$ = ['PlusEq', $1, $3]; }}
  | IDENT '-=' Expr
    {{ $$ = ['MinusEq', $1, $3]; }}
  | IDENT '<-' Expr
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
  | FINAL IDENT '=' Expr
    {{ $$ = ['FinalVar', $2, $4]; }}
  | IDENT '=' Expr
    {{ $$ = ['SetVar', $1, $3]; }}
  | LET Pointer '=' Expr
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
  | FINAL ArgumentList '=' ArgumentList
    {{ $$ = ['ArrayFinal', $2, $4]; }}
  | ArgumentList IS ArgumentList
    {{ $$ = ['ArraySet', $1, $3]; }}
  | LET ArgumentList IS ArgumentList
    {{ $$ = ['ArrayLet', $2, $4]; }}
  | FINAL ArgumentList IS ArgumentList
    {{ $$ = ['ArrayFinal', $2, $4]; }}
  | '(' Expr OR Expr ')' '=' Expr
    {{ $$ = ["SetOr", $2, $4, $7]; }}
  | '(' Expr OR Expr ')' IS Expr
    {{ $$ = ["SetOr", $2, $4, $7]; }}
  ;

Pointer
  : POINT
    {{ $$ = ['Pointer', yytext]; }}
  ;

Expr
  : Index
  | Pointer
  | NUMBER
    {{ $$ = ['Number', yytext]; }}
  | YES
    {{ $$ = ['Yes']; }}
  | NO
    {{ $$ = ['No']; }}
  | NOTHING
    {{ $$ = ['Nothing']; }}
  | PERCENT
    {{ $$ = ['Percent', yytext]; }}
  | STRING
    {{ $$ = ['String', yytext]; }}
  | Array
  | ArgumentList
  | JSON
  | EXTENDS IDENT
    {{ $$ = ['Extends', $2]; }}
  | NEW IDENT ArgumentList
    {{ $$ = ['New', $2, $3]; }}
  | FN ArgumentList Block
    {{ $$ = ['Function', $2, $3]; }}
  | Expr WHEN Expr OR_COND Expr
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
    {{ $$ = ['Condition', $1, '==', $3]; }}
  | Expr ISNT Expr
    {{ $$ = ['Condition', $1, '!==', $3]; }}
  | Expr '~=' Expr
    {{ $$ = ['InstanceCondition', $1, $3]; }}
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
  | Expr IN Expr
    {{ $$ = ['InArray', $1, $3]; }}
  | '!' Expr
    {{ $$ = ['ConditionNot', $2]; }}
  | NOT Expr
    {{ $$ = ['ConditionNot', $2]; }}
  | Expr '?'
    {{ $$ = ['ConditionCheck', $1]; }}
  | NUMBER '...' NUMBER
    {{ $$ = ['LessRange', $1, $3]; }}
  | NUMBER '..' NUMBER
    {{ $$ = ['Range', $1, $3]; }}
  | REGEX
    {{ $$ = ['Regex', yytext]; }}
  | '@' '?' Expr TO Expr
    {{ $$ = ['RandomOp', $3, $5]; }}
  | '@' '?'
    {{ $$ = ['RandomGen']; }}
  | CallArray
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
  : CondElement AND Expr
     {{ $$ = ['CondAndElement', $1, $3]; }}
  | CondElement OR Expr
     {{ $$ = ['CondOrElement', $1, $3]; }}
  | Expr
  ;

AND
  : "&&"
    {{ $$ = ['And']; }}
  | AND_COND
    {{ $$ = ['And']; }}
  ;

OR
  : "||"
    {{ $$ = ['Or']; }}
  | OR_COND
    {{ $$ = ['Or']; }}
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
  : IDENT Array
    {{ $$ = ['IndexExpr', $1, $2]; }}
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
