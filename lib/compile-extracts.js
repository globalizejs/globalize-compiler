var compile = require( "./compile" );

function alwaysArray( itemOrArray ) {
	return Array.isArray( itemOrArray ) ? itemOrArray : itemOrArray ? [ itemOrArray ] : [];
}

function compileExtracts( attributes ) {
	var cldr, cldrObject, defaultLocale, extracts, formattersAndParsers, timeZoneData, timeZoneDataObject, messages, messagesObject;
	var Globalize = require( "globalize" );

	attributes = attributes || {};
	var compilerOptions = {};
	if (attributes.template) {
		compilerOptions.template = attributes.template;
	}

	// Required attributes.
	defaultLocale = attributes.defaultLocale;
	extracts = attributes.extracts;

	// TODO
	//assert( defaultLocale )
	//assert( extracts )
	//assert( optional cldr )
	//assert( optional messages )

	// Optional attributes.
	cldr = attributes.cldr || function( locale ) {
		var cldrData = require( "cldr-data" );
		return cldrData.entireSupplemental().concat( cldrData.entireMainFor( locale ) );
	};
	if ( typeof cldr === "object" ) {
		cldrObject = cldr;
		cldr = function( /* locale */ ) {
			return cldrObject;
		};
	}

	messages = attributes.messages;
	if ( !messages ) {
		messages = {};
		messages[ defaultLocale ] = {};
	}
	if ( typeof messages === "object" ) {
		messagesObject = messages;
		messages = function( /* locale */ ) {
			return messagesObject;
		};
	}

	timeZoneData = attributes.timeZoneData || function() {
		return require( "iana-tz-data" );
	};
	if ( typeof timeZoneData === "object" ) {
		timeZoneDataObject = timeZoneData;
		timeZoneData = function() {
			return timeZoneDataObject;
		};
	}

	// TODO
	//assert( defaultLocale )
	//assert( extracts )

	Globalize.load( cldr( defaultLocale ) );
	Globalize.loadMessages( messages( defaultLocale ) );
	Globalize.loadTimeZone( timeZoneData() );
	Globalize.locale( defaultLocale );
	formattersAndParsers = alwaysArray( extracts ).reduce(function( sum, extract ) {
		[].push.apply( sum, extract( Globalize ) );
		return sum;
	}, [] );

	return compile( formattersAndParsers, compilerOptions );
}

module.exports = compileExtracts;
