'use strict';

var request = require( 'request' );
var cheerio = require( 'cheerio' );
var URL = require('url');

var SiteMeta = function(  ){


	var scrape = function( url, callback ) {

		request( url , function (error, response, body) {
			if( error ){ return callback( error, null ); }
		  if (response.statusCode == 200) {

		    return callback( null, extractMeta( response ) );

		  }else{
		  	return callback( new Error( "Inalid Response" ), null );
		  }
		})
	};


	var extractMeta = function( response ) {

		var meta = {
			title 				: "",
			description		: "",
			canonical			: "",
			favicon				: "",
			apple_touch_icon		: [],
			feeds 				: [],
			og 						: {},
			twitter				: {}

		}

		var url = response.request.uri.href;
    var $ = cheerio.load( response.body );

		/* Is HTML or RSS*/
		var type = "unknown";
		if(!!$( "html" ).length){ type = "html"; } 	// If HTML tag exists
		if(!!$( "rss" ).length){ type = "rss"; } 		// If RSS tag exists, override HTML decision

		/* Title */
		meta.title = $( "title" ).text(  ) || "";

		/* Favicon */
		/* Test for "shortcut icon" and "icon" */
		var favicon = $( "link" ).filter(function () {
			 return /^(shortcut )?icon$/i.test( $( this ).attr( "rel" ) );
		}).attr( "href" ) || "";
		meta.favicon = favicon.length ? constructURL( url, favicon ) : "";

		/* Apple-Touch-Icons */
		meta.apple_touch_icon = $( "link" ).filter(function() {
			return /^apple-touch-icon/i.test( $( this ).attr( "rel" ) );
    	// return $( this ).attr( "rel" ) ? $( this ).attr( "rel" ).toLowerCase() == 'apple-touch-icon' : false;
    }).map(function ( index, item ) {
    	var icon = $( item ).attr( "href" );
    	return constructURL( url, icon );
    }).get();

		/* Description */
		meta.description = $( "meta" ).filter(function() {
    	return $( this ).attr( "name" ) ? $( this ).attr( "name" ).toLowerCase() == 'description' : false;
    }).attr( "content" ) || "";

		/* Canonical */
		meta.canonical = $( "link" ).filter(function() {
    	return $( this ).attr( "rel" ) ? $( this ).attr( "rel" ).toLowerCase() == 'canonical' : false;
    }).attr( "href" ) || "";

		/* Feeds */
    meta.feeds = $( "link" ).filter(function() {
    	return (/application\/.{3,4}\+xml/i).test( $( this ).attr( "type" ) );
    }).map(function ( index, item ) {
    	var feed = $( item ).attr( "href" );
    	return constructURL( url, feed );
    }).get();


		/* Open Graph */
		meta.og = parseGraphContent( "og", "property", ["title", "type", "image", "url", "description", "site_name"] );

		/* Twitter */
    meta.twitter = parseGraphContent( "twitter", "name", ["card", "site", "title", "url", "description", "creator", "image"] );


		function parseGraphContent( graphtype, propertytype, itemArray ) {

			var graphContent = {};

	    itemArray.forEach( function( item ) {
	    	graphContent[item] = $( "meta" ).filter( function(){
	    		var re = new RegExp("^" + graphtype + ":" + item + "$", "i");
	  	  	return re.test( $( this ).attr( propertytype ) );
		   	}).attr( "content" ) || "";
	    });

	    return graphContent;

		}

		function constructURL( u, href ) {

			var parsedURL = URL.parse( u );
			var parsedHREF = URL.parse( href );

			// Valid HREF, meaning it included host and path
			if( parsedHREF.host !== null ){
				return parsedHREF.href;
			}

			// Missing Host, return empty string (should be error, but need to make sure handling exists)
			if( parsedURL.host === null ){
				return "";
			}

			// Include the host was the path was absolute
			if( parsedHREF.pathname.charAt(0) === '/' ){
				return parsedURL.protocol + "//" + parsedURL.host + parsedHREF.href;
			}

			// Include path as it was relative from the scraped file
			return parsedURL.protocol + "//" + parsedURL.host + parsedURL.pathname + parsedHREF.href;

		}

    return {
			'type'  : type,
    	'url'  	: url,
    	'meta' 	: meta
    }

	};


	// Make only the parse function accessible
	return {

		scrape : scrape

	};

};

module.exports = SiteMeta;
