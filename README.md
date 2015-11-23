# Iode

Iode is a fast and empirical programming language, inspired by Swift. Contributions are welcome!

More in depth, Iode is a multi-paradigm, imperative, procedural, object-oriented, and beginner-friendly programming language that compiles to JavaScript. Iode is influenced by languages such as Rust, Ruby, Go, and Swift.

# Installing the Beta

Download/clone this repository, cd to the cloned directory, and type `npm install -g`. Installation will require [NodeJS](https://nodejs.org/en/).

Quick getting-started script:

```bash
$ git clone https://github.com/iode-lang/Iode.git
$ cd Iode
$ npm install -g
```

## Using the Beta

```bash
$ iode -h

  Usage: iode [options] <files ...>

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -r, --run      runs program without outputting generated code
    -o, --output   outputs the generated code

```

Example:

```bash
$ iode -o -r some/iode/file.iode
```

## Hand-Built.. for developers

Under the hood, Iode uses **no** additional libraries for parsing or lexical analysis. This means that the download will be quite smaller (than other alt-js languages..) and that the core will be powerful.

## Designed.. for simplicity

Every aspect of Iode has been designed in a logical, empirical way to ensure serene programming for anyone, anywhere, anytime. Iode trans-compiles into JavaScript, and therefore, will run anywhere.

## Created.. for everybody

The main goal of this programming language is to have a small learning curve so that any beginner can start coding. The second half of this goal is to appeal to experienced programmers as well. Syntax suggestions are being taken into consideration, if you have an idea, [we'd be glad to hear about it!](https://github.com/iode-lang/Iode/issues/new)

## Interested in Contributing?

Awesome! If you want to help with this project but don't know what to do, there's a to-do list available [here](https://trello.com/b/uJ79uDf4/iode). All contributors are added to the `CONTRIBUTORS.md` file.

## Testing

Iode is developed on Windows 10 but should work on most operating systems such as OS X, Linux, FreeBSD, NonStop, IBM AIX, IBM System z, IBM i and other versions of MS Windows.

## License

Iode is licensed under the [permission MIT license](https://raw.githubusercontent.com/iode-lang/Iode/master/LICENSE).
