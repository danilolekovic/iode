# Getting Started

The syntax of Stripes resembles the syntax of Ruby, Go, and bits of C-like syntax (semicolons, parenthesis). Stripes is perfect for both experienced programmers, and people new to the amazing world of programming.


```rb
class Phone()
  type -> "Android",
  version -> "5.0",
  boot -> fn()
    alert("Booting phone..");
  end
end;

let myPhone = new Phone();
myPhone.boot();
```

**Pro tip!** Stripes is still under development, but is stable enough to be used.

## Development Tools

**Syntax**

* [Atom](https://github.com/danilolekovic/language-stripes)

**Development**

* [Project Template](https://github.com/danilolekovic/stripes-template)

## Get Stripes

Stripes will be released in early April 2015. As of March 2015, it is closed-source and licensed under a Creative Commons Attribution-NoDerivatives 4.0 International Public License. If you are reading this documentation after April 9th 2015, chances are that Stripes is available to the public.

To install Stripes, you will require [Node.js](https://nodejs.org/). Stripes is installed using NPM, the package manager that comes with Node.js.


```sh

$ npm install -g stripes
```

## Usage

```sh
Stripes v0.0.3

	$ stripes [args] <file>

Arguments:

	-v, --version		Shows version
	-h, --help		        Shows help
	-e, --execute		Executes compiled file
	-s, --strict		        Enables strict mode
	-ns, --no-std		Disables standard library
	-ast, --tokens		Shows tokens instead of compiling

Example:

	$ stripes -e test.stps
```

# File Types in Stripes

* **.son** acronym for Stripes Object Notation. Used for package information.
* **.litstps** short for Literate Stripes. Writing that can contain executable Stripes code.
* **.sast** acronym for Stripes Abstract Syntax Tree. Takes direct Stripes bytecode, and compiles it in very great speed.
*  **.stps** short for Stripes. The main Stripes files.

The Stripes Compiler can compile all of the file types in the Stripes family.

## Stripes Object Notation

Stripes Object Notation (SON) is used for configuration files and package information files (ex. NPM package).

```js

{
  "name" -> "stripes-project",
  "description" -> "...",
  "version" -> "0.0.1",
  "author" -> "Austin Powers <austin@powers.ca>",
  "keywords" -> [
    "stripes",
    "project",
    "cool",
    "awesome"
  ],
  "devDependencies" -> {
	"grunt" -> "*",
	"grunt-contrib-watch" -> "*",
	"shelljs" -> "*"
  }
};
```

## Literate Stripes

Literate stripes is a file that can contain any text, but can also contain executable Stripes code. This allows for very easy documentation of code. All code inside of ```<stps>...</stps>``` tags is treated as executable Stripes code. A Literate Stripes file can contain as many tags desired.


```html

This is some stuff that will not be detected. It's literal Stripes!

<stps>
console.log("This is cool");
</stps>

I know it is cool!
```

## Stripes Abstract Syntax Tree

This is the "bytecode" of Stripes. Unlike other languages, you can directly compile SAST very quickly. The entire parsing sequence is skipped and Stripes jumps straight to interpretation and compilation.


```js
["Stripes", { },
  ["Try", [
      ["CallArrayStmt", ["CallExpr", "console.log", ["ArgumentList", ["String", "\"try statement\""]]]]
    ],
    ["Catch", ["CallArray", ["CallExprNoArgs", "e"]],
      [
        ["CallArrayStmt", ["CallExpr", "console.log", ["ArgumentList", ["CallArray", ["CallExprNoArgs", "e"]]]]]
      ]
    ]
  ]
]
```

## Stripes

These are the regular, most common Stripes files. They just contain Stripes code that is parsed and compiled.


```js
let range = [1...9];

for (i:range)
  console.log(i);
end;
```

# Data Values

In Stripes, data values are automatically detected.

| Name            | Example         |
|-----------------|-----------------|
| Percent         | 50%             |
| String          | "Some string"   |
| Number          | 2               |
| Readable Number | 2_000_000       |
| Function        | fn() ... end;   |
| Call            | someFunction(); |
| Undefined       | undefined       |
| Null            | null            |
| True            | true or yes     |
| False           | false or no     |
| Identifier      | name            |
| Pointer         | foo*            |

# Variables

Variables and functions are first-class citizens. Variables are declared with the ```let``` keyword.


```js
let name = "Mario";
let kidsWhoPassedClass = 73%;
let hex = 0x01;
let regex = /[0-9]+/g;
let age = 2;
let interop = "It's ah me, #{name}!";
let bool = true;
let fun = fn() return("Yes!"); end;
let nothing = null;
let rand = @?;
let call = hi();
let pointer* = 2;
```

Variables can be changed too, unless they're constant.


```js
age = 15;
kidsWhoPassedClass = 20%;
```


Variables can also be constant, unchangeable. Final variables can only be global variables and not within functions, just like in most programming languages.

```js
final name = "John";

name = "Bill"; # Error #;
```

# Operators

In Stripes, operators are very dynamic.

|          Name         |       JavaScript      |               Stripes               |
|:---------------------:|:---------------------:|:-----------------------------------:|
|        Equal To       |          `===`        |            `==` or `is`             |
|      Not Equal To     |          `!==`        |            `!=` or `isnt`           |
|          Not          |           `!`         |             `!` or `not`            |
| Greater Than Equal To |          `>=`         |                `>=`                 |
|   Less Than Equal To  |          `<=`         |                `<=`                 |
|      Greater Than     |           `>`         |             `>` or `bigger`         |
|       Less Than       |           `<`         |             `<` or `smaller`        |
|        Validity       |         `None`        |                 `?`                 |
|        Instance       |      `instanceof`     |                `~=`                 |
|          Add          |           `+`         |                 `+`                 |
|          Sub          |           `-`         |                 `-`                 |
|          Mul          |           `*`         |                 `*`                 |
|          Div          |           `/`         |                 `/`                 |
|          Mod          |           `%`         |                 `%`                 |
|       Increment       |          `++`         |                `++`                 |
|       Decrement       |          `--`         |                `--`                 |
|        Exponent       |           `^`         |                 `^`                 |
|         Random        |         `None`        |                `@?`                 |
|          And          |          `&&`         |            `&&` or `and`            |
|           Or          | [2 Vertical Bars][1]  |    [2 Vertical Bars][1] or `or`     |

[1]: http://en.wikipedia.org/wiki/Vertical_bar
