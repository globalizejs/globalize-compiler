var escodegen = require( "escodegen" );
var esprima = require( "esprima" );

var Syntax = esprima.Syntax;

var map = {
	formatCurrency: "currencyFormatter",
	formatDate: "dateFormatter",
	formatNumber: "numberFormatter",
	formatRelativeTime: "relativeTimeFormatter",
	parseNumber: "numberParser",
	parserDate: "dateParser",
	plural: "pluralGenerator"
};

module.exports = {
	test: function( node ) {
		return node.type === Syntax.CallExpression &&
			node.callee.type === Syntax.MemberExpression &&
			node.callee.object.type === Syntax.Identifier &&
			node.callee.object.name === "Globalize" &&
			node.callee.property.type === Syntax.Identifier && (
				node.callee.property.name === "formatCurrency" ||
				node.callee.property.name === "formatDate" ||
				node.callee.property.name === "formatNumber" ||
				node.callee.property.name === "formatRelativeTime" ||
				node.callee.property.name === "parseNumber" ||
				node.callee.property.name === "parserDate" ||
				node.callee.property.name === "plural"
			);
	},

	getFormatterOrParser: function( node ) {
		return "Globalize." + map[ node.callee.property.name ] + "(" +
			node.arguments.slice( 1 ).map(function( argument ) {
				return escodegen.generate( argument );
			}).join( ", " ) +
			")";
	}
};
