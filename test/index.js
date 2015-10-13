var fs = require("fs");
var esprima = require("esprima");
var expect = require("chai").expect;
var globalizeCompiler = require("../index");

var fixtures = {
  //babel: esprima.parse(babel.transform(fs.readFileSync(__dirname + "/fixtures/es6.js")).code),
  basic: esprima.parse(fs.readFileSync(__dirname + "/fixtures/basic.js")),
  messages: esprima.parse(fs.readFileSync(__dirname + "/fixtures/messages.js"))
};

var enMessages = {
  en: {
    like: "{0, plural, one {like} other {likes} }"
  }
};

var DEFINE_BLOCK = /define\( (\[[^\]]+\]), /;
var VARIABLE_DECLARATION = /^var (\w+) = .*;$/;

function getAMDDependencies(func) {
  var fnString = func.toString();
  var dependencies = fnString.match(DEFINE_BLOCK)[1];

  return JSON.parse(dependencies);
}

function getVariableDeclarations(func) {
  var fnString = func.toString();

  return fnString.split("\n").filter(function(s) {
    return VARIABLE_DECLARATION.test(s);
  });
}

describe("Extract Formatters & Parsers", function() {
  it("should extract formatters and parsers from basic code", function() {
    var extract = globalizeCompiler.extract(fixtures.basic);
    expect(extract).to.be.a("function");

    /* FIXME
    console.log(globalizeCompiler.compileExtracts({
      defaultLocale: "en",
      extracts: extract,
      messages: enMessages
    }));
    */
  });

  it("should provide the right dependencies for message pluralization", function() {
    var compiled, dependencies, extracts, messageFormatterVar, pluralGeneratorVar,
      variableDeclarations;

    extracts = globalizeCompiler.extract(fixtures.messages);

    compiled = globalizeCompiler.compileExtracts({
      defaultLocale: "en",
      extracts: extracts,
      messages: enMessages
    });

    dependencies = getAMDDependencies(compiled);

    expect(dependencies).to.include("globalize-runtime/message");
    expect(dependencies).to.include("globalize-runtime/plural");

    variableDeclarations = getVariableDeclarations(compiled);

    messageFormatterVar = variableDeclarations.find(function (_var) {
      return _var.match(VARIABLE_DECLARATION)[1] === "messageFormatterFn";
    });
    expect(messageFormatterVar).to.exist;

    pluralGeneratorVar = variableDeclarations.find(function (_var) {
      return _var.match(VARIABLE_DECLARATION)[1] === "pluralGeneratorFn";
    });
    expect(pluralGeneratorVar).to.exist;
  });
});
