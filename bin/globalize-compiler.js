"use strict";

var fs = require( "fs" );
var GlobalizeCompiler = require( "../index" );
var nopt = require( "nopt" );
var path = require( "path" );
var pkg = require( "../package.json" );

var bundle, cldr, extracts, extraOptions, timeZoneData, input, locale, messages, opts, output, requiredOpts;

function help() {
	var out = [
		"Usage: globalize-compiler -l LOCALE [-m MESSAGES_FILE] -o DEST_FILE SRC_FILES...",
		"Example: globalize-compiler -l en -o app-en.js src/*.js",
		"",
		"Extracts formatters and parsers statically from the SRC_FILES and generates",
		"a precompiled bundle into DEST_FILE using LOCALE.",
		"",
		"General options:",
		"  -h, --help                     # Print options and usage.",
		"  -v, --version                  # Print the version number.",
		"  -l, --locale LOCALE            # Specify a LOCALE to use in compilation.",
		"  -c, --cldr CLDR_FILE           # Optional. All necessary CLDR data for given locale (JSON format).",
		"  -z, --tz TIMEZONE_DATA_FILE    # Optional. All necessary IANA time zone data (JSON format).",
		"  -m, --messages MESSAGES_FILE   # Optional. Translation messages for given locale (JSON format).",
		"  -o, --output DEST_FILE         # Destination JS file, e.g., `app-en.js`.",
		""
	];

	return out.join( "\n" );
}

opts = nopt( {
	help: Boolean,
	version: Boolean,
	locale: String,
	cldr: path,
	tz: path,
	messages: path,
	output: path
}, {
	h: "--help",
	v: "--version",
	l: "--locale",
	c: "--cldr",
	z: "--tz",
	m: "--messages",
	o: "--output"
});
requiredOpts = true;

if ( opts.version ) {
	return console.log( pkg.version );
}

if ( !opts.locale || !opts.output ) {
	requiredOpts = false;
}

extraOptions = Object.keys( opts ).filter(function( option ) {
	return !/help|version|locale|cldr|tz|messages|output|argv/.test( option );
});

if ( extraOptions.length ) {
	console.log( "Invalid options:", extraOptions.join( ", " ), "\n" );
}

if ( opts.help || !requiredOpts || extraOptions.length ) {
	return console.log( help() );
}

input = opts.argv.remain;
locale = opts.locale;
cldr = opts.cldr;
timeZoneData = opts.tz;
messages = opts.messages;
output = opts.output;

cldr = cldr ? JSON.parse( fs.readFileSync( cldr ) ) : null;
timeZoneData = timeZoneData ? JSON.parse( fs.readFileSync( timeZoneData ) ) : null;
messages = messages ? JSON.parse( fs.readFileSync( messages ) ) : null;

extracts = input.map(function( input ) {
	return GlobalizeCompiler.extract( input );
});

bundle = GlobalizeCompiler.compileExtracts({
	defaultLocale: locale,
	cldr: cldr,
	timeZoneData: timeZoneData,
	messages: messages,
	extracts: extracts
});

fs.writeFileSync( output, bundle );
