var Globalize = require("./fixtures/basic-compiled-en-formatters");
var expect = require("chai").expect;
Globalize.locale("en");

describe("The compiled `basic.js`", function() {
	/**
	 * Date
	 */
	it("should include support for dateFormatter", function() {
		var result = Globalize.dateFormatter({time: "medium"})(new Date(2017, 3, 15, 12, 31, 45));
		// Note, the reason for the loose match below is due to ignore the local time zone differences.
		expect(result).to.have.string("31:45");
	});

	it("should include support for dateToPartsFormatter", function() {
		var result = Globalize.dateToPartsFormatter({time: "long"})(new Date(2017, 3, 15, 10, 17, 37));
		expect(result).to.include({type: "second", value: "37"});
	});

	it("should include support for formatDate", function() {
		var result = Globalize.formatDate(new Date(2017, 3, 15), {date: "medium"});
		// Note, the reason for the loose match below is due to ignore the local time zone differences.
		expect(result).to.have.string("Apr");
		expect(result).to.have.string("2017");
	});

	it("should include support for formatDate with timeZone support", function() {
		var result = Globalize.formatDate(new Date("2017-04-15T12:00:00Z"), {datetime: "full", timeZone: "America/Sao_Paulo"});
		expect(result).to.equal("Saturday, April 15, 2017 at 9:00:00 AM Brasilia Standard Time");
	});

	it("should include support for formatDateToParts", function() {
		var result = Globalize.formatDateToParts(new Date(2017, 3, 15), {date: "long"});
		expect(result).to.include({type: "month", value: "April"});
		expect(result).to.include({type: "year", value: "2017"});
	});

	it("should include support for dateParser", function() {
		var result = Globalize.dateParser({skeleton: "MMMd", timeZone: "America/New_York"})("Jan 1");
		expect(result.getMonth()).to.equal(0);
		expect(result.getDate()).to.equal(1);
	});

	it("should include support for parseDate", function() {
		var result = Globalize.parseDate("1/2/1982");
		expect(result.getFullYear()).to.equal(1982);
		expect(result.getMonth()).to.equal(0);
		expect(result.getDate()).to.equal(2);
	});

	it("should include support for parseDate with timeZone support", function() {
		var result = Globalize.parseDate("January 1, 2000 at 12:00:00 AM EST", {datetime: "long", timeZone: "America/New_York"});
		expect(result).to.deep.equal(new Date("2000-01-01T05:00:00Z"));
	});

	/**
	 * Number
	 */
	it("should include support for numberFormatter", function() {
		var result = Globalize.numberFormatter({minimumFractionDigits: 0, maximumFractionDigits: 10})(Math.PI);
		expect(result).to.equal("3.1415926536");
	});

	it("should include support for formatNumber", function() {
		var result = Globalize.formatNumber(Math.PI);
		expect(result).to.equal("3.142");
	});

	it("should include support for parseNumber", function() {
		var result = Globalize.parseNumber("1,234.56");
		expect(result).to.equal(1234.56);
	});

	/**
	 * Currency
	 */
	it("should include support for currencyFormatter", function() {
		var result = Globalize.currencyFormatter("EUR")(9.99);
		expect(result).to.equal("€9.99");
	});

	it("should include support for formatCurrency", function() {
		var result = Globalize.formatCurrency(69900, "USD");
		expect(result).to.equal("$69,900.00");
	});

	/**
	 * Message
	 */
	it("should include support for pluralGenerator", function() {
		var result = Globalize.pluralGenerator({type: "ordinal"})(2);
		expect(result).to.equal("two");
	});

	it("should include support for plural", function() {
		var result = Globalize.plural(5);
		expect(result).to.equal("other");
	});

	it("should include support for messageFormatter", function() {
		var result = Globalize.messageFormatter("task")({count: 1000, formattedCount: "1,000"});
		expect(result).to.equal("You have 1,000 tasks remaining");
	});

	it("should include support for formatMessage", function() {
		var result = Globalize.formatMessage("like", 0);
		expect(result).to.equal("Be the first to like this");
	});

	/**
	 * Relative Time
	 */

	// Use relativeTimeFormatter.
	it("should include support for relativeTimeFormatter", function() {
		var result = Globalize.relativeTimeFormatter("day")(0);
		expect(result).to.equal("today");
	});

	// Use formatRelativeTime.
	it("should include support for formatRelativeTime", function() {
		var result = Globalize.formatRelativeTime(1, "second");
		expect(result).to.equal("in 1 second");
	});

	/**
	 * Unit
	 */

	// Use unitFormatter.
	it("should include support for unitFormatter", function() {
		var result = Globalize.unitFormatter("kilowatt")(120);
		expect(result).to.equal("120 kilowatts");
	});

	// Use formatUnit.
	it("should include support for formatUnit", function() {
		var result = Globalize.formatUnit(60, "mile/hour", {form: "short"});
		expect(result).to.equal("60 mph");
	});
});
