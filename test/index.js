var fs = require("fs");
var esprima = require("esprima");
var expect = require("chai").expect;
var globalizeCompiler = require("../index");

var fixtures = {
  //babel: esprima.parse(babel.transform(fs.readFileSync(__dirname + "/fixtures/es6.js")).code),
  basic: esprima.parse(fs.readFileSync(__dirname + "/fixtures/basic.js"))
};

describe("Extract Formatters & Parsers", function() {
  it("should extract formatters and parsers from basic code", function() {
    var extract = globalizeCompiler.extract(fixtures.basic);
    expect(extract).to.be.a("function");

    // FIXME
    console.log(globalizeCompiler.compileExtracts({
      defaultLocale: "en",
      extracts: extract
    }));
  });

});
