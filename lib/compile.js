var COMPILED_ORDER, DEPENDENCIES, DEPENDENCIES_VARS, slice, template,
	extend = require( "util" )._extend,
	fs = require( "fs" );

COMPILED_ORDER = [

	// No dependencies.
	"numberFormatter",
	"numberParser",
	"pluralGenerator",

	// Depends on plural.
	"messageFormatter",

	// Depends on number and/or plural.
	"currencyFormatter",
	"dateFormatter",
	"dateParser",
	"relativeTimeFormatter",
	"unitFormatter"
];

DEPENDENCIES = {
	currencyFormatter: { currency: true, number: true },
	dateFormatter: { date: true },
	dateParser: { date: true },
	messageFormatter: { message: true },
	numberFormatter: { number: true },
	numberParser: { number: true },
	pluralGenerator: { plural: true },
	relativeTimeFormatter: { number: true, plural: true, "relative-time": true },
	unitFormatter: { number: true, plural: true, unit: true },
};

DEPENDENCIES_VARS = {
	currencyFormatter: {
		currencyFormatterFn: true,
		currencyNameFormat: true,
		validateParameterPresence: true,
		validateParameterTypeNumber: true
	},
	dateFormatter: {
		dateFormatterFn: true,
		dateFormat: true,
		validateParameterPresence: true,
		validateParameterTypeDate: true
	},
	dateParser: {
		dateParserFn: true,
		dateParse: true,
		dateTokenizer: true,
		validateParameterPresence: true,
		validateParameterTypeString: true
	},
	messageFormatter: {
		messageFormatterFn: true,
		messageFormat: true,
		validateParameterTypeMessageVariables: true
	},
	numberFormatter: {
		numberFormatterFn: true,
		numberFormat: true,
		numberRound: true,
		validateParameterPresence: true,
		validateParameterTypeNumber: true
	},
	numberParser: {
		numberParserFn: true,
		numberParse: true,
		validateParameterPresence: true,
		validateParameterTypeString: true
	},
	pluralGenerator: {
		pluralGeneratorFn: true,
		validateParameterPresence: true,
		validateParameterTypeNumber: true
	},
	relativeTimeFormatter: {
		relativeTimeFormatterFn: true,
		validateParameterPresence: true,
		validateParameterTypeNumber: true
	},
	unitFormatter: {
		unitFormatterFn: true,
		validateParameterPresence: true,
		validateParameterTypeNumber: true
	}
};

slice = [].slice;
template = fs.readFileSync( __dirname + "/compile.template" ).toString( "utf-8" );

function functionName( fn ) {
	return /^function\s+([\w\$]+)\s*\(/.exec( fn.toString() )[ 1 ];
}

function stringifyIncludingFunctionsAndUndefined( object ) {
	var json,
		fnPlaceholder = "fnPlaceholderBRVOhnVwmkNxKbCxydG9dZLhwf4puXOzkscBSgwk",
		fns = [],
		undefinedPlaceholder = "undefinedPlaceholderBRVOhnVwmkNxKbCxydG9dZLhwf4puXOzkscBSgwk";
	json = JSON.stringify( object, function( key, value ) {
		if ( typeof value === "function" ) {
			fns.push( value );
			return fnPlaceholder;
		} else if ( value === undefined ) {
			return undefinedPlaceholder;
		}
		return value;
	});
	return json.replace( new RegExp( "\"" + fnPlaceholder + "\"", "g" ), function() {
		var fn = fns.shift();
		if ( "generatorString" in fn ) {
			return fn.generatorString();
		} else {
			return fn.toString();
		}
	}).replace( new RegExp( "\"" + undefinedPlaceholder + "\"", "g" ), "" );
}

function compile( formatterOrParser ) {
	var fnName = /^function\s+([\w\$]+)\s*\(/.exec( formatterOrParser.toString() )[ 1 ],
		runtimeKey = formatterOrParser.runtimeKey,
		runtimeArgs = formatterOrParser.runtimeArgs;

	runtimeArgs = runtimeArgs.map( stringifyIncludingFunctionsAndUndefined ).join( ", " );

	return "Globalize." + runtimeKey + " = " + fnName + "Fn(" +
		runtimeArgs + ");";
}

function deduceDependenciesVars( formatterOrParser ) {
	return DEPENDENCIES_VARS[ functionName( formatterOrParser ) ];
}

/**
 * Default template function
 * properties:
 *  - compiled
 *  - dependencies
 */
function defaultTemplate( properties ) {
	var params = {};

	params.compiled = properties.code;
	params.dependenciesAmd = JSON.stringify( properties.dependencies );
	params.dependenciesCjs = properties.dependencies.map(function( dependency ) {
		return "require(\"globalize/dist/" + dependency + "\")";
	}).join( ", " );

	return template.replace( /{{[a-zA-Z]+}}/g, function( name ) {
		name = name.slice( 2, -2 );
		return params[ name ];
	});
}

/**
 * Returns a string with the compiled formatters and parsers.
 *
 * @param {formattersAndParsers} object or array
 * @param {options} object
 */
function compiler( formattersAndParsers, options ) {
	var dependencies,
		code,
		dependenciesVars,
		templateFn,
		extractedFormattersAndParsers = [],
		formattersAndParsersKeys = [];

	options = options || {};
	templateFn = options.template || defaultTemplate;

	// Extract Formatters and Parsers from arguments (and its nested formatters and parsers).
	function extractFormattersAndParsers( object ) {
		JSON.stringify( object, function( key, value ) {

			// If a node is a formatter or a parser function, push it to our Array.
			if ( typeof value === "function" && "runtimeArgs" in value ) {
				extractedFormattersAndParsers.push( value );

				// ... and do the same for its runtimeArgs (extract nested formatters or parsers).
				extractFormattersAndParsers( value.runtimeArgs );
			}

			return value;
		});
	}
	function uniqueFormattersAndParsers( formatterOrParser ) {
		var filter = formattersAndParsersKeys.indexOf( formatterOrParser.runtimeKey ) === -1;
		formattersAndParsersKeys.push( formatterOrParser.runtimeKey );
		return filter;
	}
	extractFormattersAndParsers( formattersAndParsers );
	extractedFormattersAndParsers = extractedFormattersAndParsers.filter( uniqueFormattersAndParsers );

	if ( !extractedFormattersAndParsers.length ) {
		throw new Error( "No formatters or parsers has been provided" );
	}

	// Generate the compiled functions.
	code = extractedFormattersAndParsers.sort(function( a, b ) {
		a = functionName( a );
		b = functionName( b );
		return COMPILED_ORDER.indexOf( a ) - COMPILED_ORDER.indexOf( b );
	}).map( compile ).join( "\n" );

	// Generate dependency assignments and requirements.
	dependencies = Object.keys( extractedFormattersAndParsers.map( functionName ).reduce(function( sum, i ) {
		return extend( sum, DEPENDENCIES[ i ] );
	}, {}));

	dependencies = dependencies.map(function( dependency ) {
		return "globalize-runtime/" + dependency;
	});
	dependenciesVars = extractedFormattersAndParsers
		.map( deduceDependenciesVars )
		.reduce(function( sum, i ) {
			return extend( sum, i );
		}, {});
	dependenciesVars = Object.keys( dependenciesVars )
		.map(function( dependency ) {
			return "var " + dependency + " = Globalize._" + dependency + ";";
		}).join( "\n" );

	code = dependenciesVars + "\n\n" + code;

	/*
	// Generate exports.
	if ( args.length === 1 ) {
		properties.exports = args[ 0 ];
	} else {
		properties.exports = args;
	}
	properties.exports = "return " + stringifyIncludingFunctionsAndUndefined( properties.exports );
	*/

	return templateFn({
		code: code,
		dependencies: dependencies
	});
}

module.exports = compiler;
