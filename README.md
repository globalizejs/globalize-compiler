## Why Globalize compiler?

Use *globalize-compiler* (a) to extract your Globalize formatters and parsers statically from your source code and (b) to compile + to bundle them into a JavaScript file.

For information about Globalize, please read its [documentation](https://github.com/jquery/globalize#README.md). More specifically, about [Performance](https://github.com/rxaviers/globalize/tree/fix-398-runtime#performance) and [Compilation and the Runtime modules](https://github.com/rxaviers/globalize/tree/fix-398-runtime#compilation-and-the-runtime-modules).

## Usage

### CLI

Use the command line interface as a convenience over using the API directly. It's sufficient in most cases. It (a) extracts your formatters and parsers statically and (b) compiles + generates the bundle JavaScript. See their respective APIs [`.extract()`][] and [`.compileExtracts()`][] for constrains and other general information.

    # Install
    [sudo] npm install -g globalize-compiler

    # globalize-compiler -l LOCALE [-c CLDR_FILE] [-m MESSAGES_FILE] -o DEST_FILE SRC_FILES...
    globalize-compiler -l en \
        -m messages/en.json \
        -o my-compiled-formatters-and-parsers.js \
        src/*.js

**`SRC_FILES`** Source JavaScript files to extract the formatters and parsers from.

**`-h, --help`** Print options and usage.

**`-v, --version`** Print the version number.

**`-l, --locale LOCALE`** Specify a LOCALE to use in compilation.

**`-c, --cldr CLDR_FILE`** Optional. All necessary CLDR data for given locale (JSON format).

**`-z, --tz TIME_ZONE_FILE`** Optional. All necessary time zone data (JSON format).

**`-m, --messages MESSAGES_FILE`** Optional. Translation messages for given locale (JSON format).

**`-o, --output DEST_FILE`** Destination JavaScript file, e.g., `app-en.js`.

### API

Use the API directly in your Grunt or Gulp tasks.

    npm install globalize-compiler --save-dev

*globalize-compiler* has three functions: [`.compile()`][], [`.compileExtracts()`][], and [`.extract()`][].

```js
var globalizeCompiler = require( "globalize-compiler" );
// > { compile: [Function: compiler],
//     compileExtracts: [Function: compileExtracts],
//     extract: [Function: extractor] }
```

#### `.compile( formattersAndParsers, options )`

**formattersAndParsers** is an *Array* or an *Object* containing formatters and/or parsers, e.g.:

```js
// Array
[
    formatter1,
    formatter2,
    ...,
    parser1,
    parser2,
    ...
]

// Object
{
    formatter1Key: formatter1,
    formatter2Key: formatter2,
    ...,
    parser1Key: parser1,
    parser2Key: parser2,
    ...
}
```

**options** is an *Object* with the following properties:

&nbsp;&nbsp;&nbsp; **template** optional. A function that replaces the default template. The function will receive a single *Object* parameter with two properties:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **code**: string, the source of the compiled formatters and parsers.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; **dependencies**: array, a list of globalize runtime modules that the compiled code depends on, e.g. `globalize-runtime/number`.

**Returns** a *String* with the generated JavaScript bundle (UMD wrapped) including the compiled formatters and parsers.

**Example**

```javascript
fs.writeFileSync( "my-formatters-and-parsers.js", globalizeCompiler.compile([
    formatter1,
    formatter2,
    ...,
    parser1,
    parser2,
    ...
]));
// > "A very long String with the generate JavaScript bundle content..."
```

#### `.extract( input )`

**input** is a *String* with a filename, or a *String* with the file content, or an AST *Object*.

**Returns** an extract. An extract is a *Function* taking one argument: Globalize, the Globalize *Object*; and returning an *Array* with the formatters and parsers created using the passed Globalize.

**Example**

```js
var extract = globalizeCompiler.extract( "src.js" );
// > [Function]
```

**Extracting constrains**

Global methods and its aliases are extracted, for example:

```js
Globalize.numberFormatter( ... );
Globalize.formatNumber( ... );
```

Instance methods and its aliases are NOT extracted, for example:

```js
// Currently, NOT extracted:
var globalize = new Globalize( locale );
globalize.numberFormatter( ... );
globalize.formatNumber( ... );
```

#### `.compileExtracts( attributes )`

**attributes** is an *Object* with the following properties:

&nbsp;&nbsp;&nbsp; **extracts** is an Array of extracts obtained by [`.extract()`][].

&nbsp;&nbsp;&nbsp; **defaultLocale** is a locale to be used as `Globalize.locale( defaultLocale )` when generating the extracted formatters and parsers.

&nbsp;&nbsp;&nbsp; **cldr** optional. It's an *Object* with CLDR data (in the JSON format) or a *Function* taking one argument: locale, a *String*; returning an *Object* with the CLDR data for the passed locale. Defaults to the entire supplemental data plus the entire main data for the defaultLocale.

&nbsp;&nbsp;&nbsp; **timeZoneData** optional. It's an *Object* with IANA time zone data (in the JSON format) or a *Function* returning an *Object* with the IANA time zone data. Defaults to the entire IANA time zone data from [iana-tz-data](https://github.com/rxaviers/iana-tz-data) package.

&nbsp;&nbsp;&nbsp; **messages** optional. It's an *Object* with messages data (in the JSON format) or a *Function* taking one argument: locale, a *String*; returning an *Object* with the messages data for the passed locale. Defaults to `{}`.

&nbsp;&nbsp;&nbsp; **template** optional. A function that replaces the default template. See [`.compile()`][] for more details.

**Returns** a *String* with the generated JavaScript bundle as returned by the [`.compile()`][] function.

**Example**

```js
var extracts = [ "src/a.js", "src/b.js" ].map(function( input ) {
  return GlobalizeCompiler.extract( input );
});

var bundle = GlobalizeCompiler.compileExtracts({
  defaultLocale: "en",
  extracts: extracts
});
// > "A very long String with the generate JavaScript bundle content..."
```

**Important** Read [`.extract()`][] for more information about the extracting constrains.

[`.compile()`]: #compile-formattersandparsers-
[`.compileExtracts()`]: #compileextracts-attributes-
[`.extract()`]: #extract-input-

## Development

### Tests

    npm install
    npm test
