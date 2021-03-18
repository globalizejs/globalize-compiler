var like;
var Globalize = require("globalize");

/**
 * Date
 */

// Use dateFormatter.
var dateFormatter = Globalize.dateFormatter({time: "medium"});
console.log(dateFormatter(new Date()));

// Use formatDate.
console.log(Globalize.formatDate(new Date(), {date: "medium"}));

// Use formatDate in specific time zones.
console.log(Globalize.formatDate(new Date(), {
	datetime: "full",
	timeZone: "America/Sao_Paulo"
}));

// Use dateToPartsFormatter.
var dateToPartsFormatter = Globalize.dateToPartsFormatter({time: "long"});
console.log(dateToPartsFormatter(new Date()));

// Use formatDateToParts.
console.log(Globalize.formatDateToParts(new Date(), {date: "long"}));

// Use dateParser in specific time zones.
var dateParser = Globalize.dateParser({skeleton: "MMMd", timeZone: "America/New_York"});
console.log(dateParser("Jan 1"));

dateParser = Globalize.dateParser({skeleton: "MMMd", timeZone: "Europe/Oslo"});
console.log(dateParser("Jan 1"));

// Use parseDate.
console.log(Globalize.parseDate("1/2/1982"));

// Use parseDate in specific time zones.
console.log(Globalize.parseDate("January 1, 2000 at 12:00:00 AM EST", {
	datetime: "long",
	timeZone: "America/New_York"
}));

/**
 * Number
 */

// Use numberFormatter.
var numberFormatter = Globalize.numberFormatter({minimumFractionDigits: 0, maximumFractionDigits: 10});
console.log(numberFormatter(Math.PI));

// Use formatNumber.
console.log(Globalize.formatNumber(12345.6789));

// Use parseNumber.
console.log(Globalize.parseNumber("12345.6789"));

/**
 * Currency
 */

// Use currencyFormatter.
var currencyFormatter = Globalize.currencyFormatter("EUR");
console.log(currencyFormatter(9.99));

// Use formatCurrency.
console.log(Globalize.formatCurrency(69900, "USD"));

/**
 * Message
 */

// Use pluralGenerator.
var pluralGenerator = Globalize.pluralGenerator({type: "ordinal"});
console.log(pluralGenerator(2));

// Use plural.
console.log(Globalize.plural(12345.6789));

// Use messageFormatter.
like = Globalize.messageFormatter("like");
console.log(like(0));
console.log(like(1));
console.log(like(2));
console.log(like(3));

// Use messageFormatter.
like = Globalize.messageFormatter("like");

// Use formatMessage.
console.log(Globalize.formatMessage("task", {count: 1000, formattedCount: "1,000"}));

/**
 * Relative Time
 */

// Use relativeTimeFormatter.
var relativeTimeFormatter = Globalize.relativeTimeFormatter("day");
console.log(relativeTimeFormatter(0));

// Use formatRelativeTime.
console.log(Globalize.formatRelativeTime(-35, "second"));

/**
 * Unit
 */

// Use unitFormatter.
var unitFormatter = Globalize.unitFormatter("kilowatt");
console.log(unitFormatter(120));

// Use formatUnit.
console.log(Globalize.formatUnit(60, "mile/hour", {form: "short"}));
