var Globalize = require("./fixtures/basic-compiled-en-formatters");
var expect = require("chai").expect;
Globalize.locale("en");

describe("The compiled `basic.js`", function() {
	it("should include formatDate", function() {
		var result = Globalize.formatDate(new Date(2017, 3, 15), {date: "medium"});
		// Note, the reason for the loose match below is due to ignore the local time zone differences.
		expect(result).to.have.string("Apr");
		expect(result).to.have.string("2017");
	});

	it("should include formatDateToParts", function() {
		var result = Globalize.formatDateToParts(new Date(2017, 3, 15), {datetime: "medium"});
		expect(result).to.include({type: "month", value: "Apr"});
		expect(result).to.include({type: "year", value: "2017"});
	});

	it("should include formatNumber", function() {
		var result = Globalize.formatNumber(Math.PI);
		expect(result).to.equal("3.142");
	});

	it("should include formatCurrency", function() {
		var result = Globalize.formatCurrency(69900, "USD");
		expect(result).to.equal("$69,900.00");
	});

	it("should include formatMessage", function() {
		var result = Globalize.formatMessage("like", 0);
		expect(result).to.equal("Be the first to like this");
	});

	it("should include formatRelativeTime", function() {
		var result = Globalize.formatRelativeTime(1, "second");
		expect(result).to.equal("in 1 second");
	});

	it("should include formatUnit", function() {
		var result = Globalize.formatUnit(60, "mile/hour", {form: "short"});
		expect(result).to.equal("60 mph");
	});

	it("should include parseNumber", function() {
		var result = Globalize.parseNumber("1,234.56");
		expect(result).to.equal(1234.56);
	});

	it("should include parseDate", function() {
		var result = Globalize.parseDate("1/2/1982");
		expect(result.getFullYear()).to.equal(1982);
		expect(result.getMonth()).to.equal(0);
		expect(result.getDate()).to.equal(2);
	});
});
