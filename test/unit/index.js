var fs = require("fs");
var esprima = require("esprima");
var expect = require("chai").expect;
var globalizeCompiler = require("../../index");

var fixtures = {
	//babel: esprima.parse(babel.transform(fs.readFileSync(__dirname + "/fixtures/es6.js")).code),
	basic: esprima.parse(fs.readFileSync(__dirname + "/fixtures/basic.js"))
};

describe("Extract Formatters & Parsers", function() {
	var compiledString, extract;

	it("should extract formatters and parsers from basic code", function() {
		extract = globalizeCompiler.extract(fixtures.basic);
		expect(extract).to.be.a("function");
	});

	it("should compile extracts from basic code", function() {
		compiledString = globalizeCompiler.compileExtracts({
			defaultLocale: "en",
			messages: {
				en: {
					like: "Foo"
				}
			},
			extracts: extract
		});

		expect(compiledString).to.be.a("string");
	});
});
