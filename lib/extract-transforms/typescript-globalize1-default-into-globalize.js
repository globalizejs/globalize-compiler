var esprima = require( "esprima" );

var Syntax = esprima.Syntax;

function isDefaultProperty(prop) {
	return (prop.type === Syntax.Literal && prop.value === "default") ||
		(prop.type === Syntax.Identifier && prop.name === "default");
}

/**
 * Transform `globalize_1["default"].<fn>` or `globalize_1.default.<fn>`
 * (commonly generated when transpiling TypeScript) into `Globalize.<fn>`.
 */
module.exports = {
	test: function( node ) {
		return node.type === Syntax.CallExpression &&
			node.callee.type === Syntax.MemberExpression &&
			node.callee.object.type === Syntax.MemberExpression &&
			node.callee.object.object.type === Syntax.Identifier &&
			node.callee.object.object.name === "globalize_1" &&
			isDefaultProperty(node.callee.object.property);
	},

	transform: function( node ) {
		node.callee.object = {
			type: Syntax.Identifier,
			name: "Globalize"
		};
	}
};