#!/usr/bin/env node
var argv = require('minimist')(process.argv.slice(2));
var SiteMeta = require( './lib' )(  );

argv._.forEach( function( item ) {
	console.time( "Scraping " + item );
	SiteMeta.scrape( item, function( err, result ) {
		if( err ){ return console.log( err ); }
		console.log( "\n" );
		console.timeEnd( "Scraping " + item );
		return console.dir( result );
	});
});