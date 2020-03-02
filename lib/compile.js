var COMPILED_ORDER, DEPENDENCIES, DEPENDENCIES_VARS, dataCache, fnPlaceholder, fnPlaceholderRe,
	regexpPlaceholder, regexpPlaceholderRe, template, undefinedPlaceholder, undefinedPlaceholderRe,
	extend = require( "util" )._extend,
	fs = require( "fs" );

COMPILED_ORDER = [

	// No dependencies.
	"numberToPartsFormatter",
	"numberFormatter",
	"numberParser",
	"pluralGenerator",

	// Depends on plural.
	"messageFormatter",

	// Depends on number and/or plural.
	"currencyToPartsFormatter",
	"currencyFormatter",
	"dateToPartsFormatter",
	"dateFormatter",
	"dateParser",
	"relativeTimeFormatter",
	"unitFormatter"
];

DEPENDENCIES = {
	currencyFormatter: { currency: true, number: true },
	dateFormatter: { date: true },
	dateToPartsFormatter: { date: true },
	dateParser: { date: true },
	messageFormatter: { message: true },
	numberFormatter: { number: true },
	numberParser: { number: true },
	pluralGenerator: { plural: true },
	relativeTimeFormatter: { number: true, plural: true, "relative-time": true },
	unitFormatter: { number: true, plural: true, unit: true }
};

DEPENDENCIES_VARS = {
	currencyFormatter: {
		currencyFormatterFn: true
	},
	currencyToPartsFormatter: {
		currencyToPartsFormatterFn: true
	},
	dateFormatter: {
		dateFormatterFn: true
	},
	dateToPartsFormatter: {
		dateToPartsFormatterFn: true
	},
	dateParser: {
		dateParserFn: true
	},
	messageFormatter: {
		messageFormatterFn: true
	},
	numberFormatter: {
		numberFormatterFn: true,
		numberRound: true
	},
	numberToPartsFormatter: {
		numberToPartsFormatterFn: true,
		numberRound: true
	},
	numberParser: {
		numberParserFn: true
	},
	pluralGenerator: {
		pluralGeneratorFn: true
	},
	relativeTimeFormatter: {
		relativeTimeFormatterFn: true
	},
	unitFormatter: {
		unitFormatterFn: true
	}
};

dataCache = {};

template = fs.readFileSync( __dirname + "/compile.template" ).toString( "utf-8" );

function functionName( fn ) {
	return /^function\s+([\w\$]+)\s*\(/.exec( fn.toString() )[ 1 ];
}

fnPlaceholder = "fnPlaceholderBRVOhnVwmkNxKbCxydG9dZLhwf4puXOzkscBSgwk",
fnPlaceholderRe = new RegExp( "\"" + fnPlaceholder + "\"", "g" ),
regexpPlaceholder = "regexpPlaceholderBRVOhnVwmkNxKbCxydG9dZLhwf4puXOzkscBSgwk",
regexpPlaceholderRe = new RegExp( "\"" + regexpPlaceholder + "\"", "g" ),
undefinedPlaceholder = "undefinedPlaceholderBRVOhnVwmkNxKbCxydG9dZLhwf4puXOzkscBSgwk",
undefinedPlaceholderRe = new RegExp( "\"" + undefinedPlaceholder + "\"", "g" );

function stringifyIncludingFunctionsAndRegExpsAndUndefined( object ) {
	var json,
		fns = [],
		regexps = [];
	json = JSON.stringify( object, function( key, value ) {
		if ( typeof value === "function" ) {
			fns.push( value );
			return fnPlaceholder;
		} else if ( value instanceof RegExp ) {
			regexps.push( value );
			return regexpPlaceholder;
		} else if ( value === undefined ) {
			return undefinedPlaceholder;
		}
		return value;
	});
	return json.replace( fnPlaceholderRe, function() {
		var fn = fns.shift();
		if ( "generatorString" in fn ) {
			return fn.generatorString();
		} else if ( "dataCacheKey" in fn ) {
			dataCache[ fn.dataCacheKey ] = fn();
			return "getCache(\"" + fn.dataCacheKey + "\")";
		} else {
			return fn.toString();
		}
	}).replace( regexpPlaceholderRe, function() {
		return regexps.shift().toString();
	}).replace( undefinedPlaceholderRe, "" );
}

function compile( formatterOrParser ) {
	var fnName = /^function\s+([\w\$]+)\s*\(/.exec( formatterOrParser.toString() )[ 1 ],
		runtimeKey = formatterOrParser.runtimeKey,
		runtimeArgs = formatterOrParser.runtimeArgs;

	runtimeArgs = runtimeArgs.map( stringifyIncludingFunctionsAndRegExpsAndUndefined ).join( ", " );

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
	var code, dependencies, dependenciesVars, templateFn,
		dataCacheCode = "",
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

	// Generate the optional dataCache.
	if ( Object.keys( dataCache ).length ) {
		dataCacheCode = "var dataCache = " + JSON.stringify( dataCache ) + ";\n" +
			"function getCache(key) {\n" +
			"	return function() {\n" +
			"		return dataCache[key];\n" +
			"	};\n" +
			"}\n";
	}

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

	code = dependenciesVars + "\n\n" + dataCacheCode + code;

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
