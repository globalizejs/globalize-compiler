var escodegen = require( "escodegen" );
var esprima = require( "esprima" );

var Syntax = esprima.Syntax;

var map = {
	formatCurrency: "currencyFormatter",
	formatCurrencyToParts: "currencyToPartsFormatter",
	formatDate: "dateFormatter",
	formatDateToParts: "dateToPartsFormatter",
	formatNumber: "numberFormatter",
	formatNumberToParts: "numberToPartsFormatter",
	formatRelativeTime: "relativeTimeFormatter",
	formatUnit: "unitFormatter",
	parseNumber: "numberParser",
	parseDate: "dateParser",
	plural: "pluralGenerator"
};

module.exports = {
	test: function( node ) {
		return node.type === Syntax.CallExpression &&
			node.callee.type === Syntax.MemberExpression &&
			node.callee.object.type === Syntax.Identifier &&
			node.callee.object.name === "Globalize" &&
			node.callee.property.type === Syntax.Identifier &&
			Object.keys(map).some(function(fn) {
				return node.callee.property.name === fn;
			});
	},

	getFormatterOrParser: function( node ) {
		return "Globalize." + map[ node.callee.property.name ] + "(" +
			node.arguments.slice( 1 ).map(function( argument ) {
				return escodegen.generate( argument );
			}).join( ", " ) +
			")";
	}
};
