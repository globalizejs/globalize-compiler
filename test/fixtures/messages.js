var like;
var Globalize = require( "globalize" );

Globalize.load(
	require( "cldr-data/main/en/ca-gregorian" ),
	require( "cldr-data/main/en/numbers" ),
	require( "cldr-data/supplemental/plurals" ),
	require( "cldr-data/supplemental/likelySubtags" )
);
Globalize.loadMessages( require( "./messages/en" ) );

// Set "en" as our default locale.
Globalize.locale( "en" );

// Use Globalize to format a message with plural inflection.
like = Globalize.messageFormatter( "like" );
console.log( like( 0 ) );
console.log( like( 1 ) );
console.log( like( 2 ) );
console.log( like( 3 ) );
