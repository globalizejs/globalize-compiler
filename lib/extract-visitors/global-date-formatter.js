var escodegen = require( "escodegen" );
var esprima = require( "esprima" );

var Syntax = esprima.Syntax;

var map = {
	formatCurrency: "currencyFormatter",
	formatDate: "dateToPartsFormatter",
	formatDateToParts: "dateToPartsFormatter",
	formatNumber: "numberFormatter",
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
			node.callee.property.name === "dateFormatter";
	},

	getFormatterOrParser: function( node ) {
		return "Globalize.dateToPartsFormatter(" +
			escodegen.generate( node.arguments[ 0 ] ) +
			")";
	}
};
