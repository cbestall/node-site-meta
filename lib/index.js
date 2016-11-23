'use strict';

var request = require( "request" );
var cheerio = require( "cheerio" );
var URL = require("url");
var Iconv = require("iconv").Iconv;
var detect_encoding = require("detect-character-encoding");

var SiteMeta = function(  ){

	var scrape = function( url, callback ) {

		request({
			"uri" : url
			,"encoding" : null
		}, function (error, response, body) {
			if( error ){ return callback( error, null ); }
		  if ( response.statusCode == 200 ) {

				var from_encoding = detect_encoding( body ).encoding;

				if ( from_encoding !== "UTF-8" ) {
					// convert non utf-8 characters to utf-8 - ignore what can't be converted
					var iconv = new Iconv( from_encoding, "UTF-8//TRANSLIT//IGNORE" );
					body = iconv.convert( body ).toString( "UTF-8" );
				}
		    return callback( null, extractMeta( response.request.uri.href, body ) );

		  }else{
		  	return callback( new Error( "Inalid Response" ), null );
		  }
		});

	};


	var extractMeta = function( url, body ) {

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

    var $ = cheerio.load( body );

		/* Is HTML or RSS*/
		var type = "unknown";
		if(!!$( "html" ).length){ type = "html"; } 	// If HTML tag exists
		if(!!$( "channel" ).length){ type = "rss"; } 		// If RSS tag exists, override HTML decision

		/* Title (first instance) */
		meta.title = $( "title" ).eq(0).text(  ) || "";

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
    	return $( this ).attr( "name" ) ? $( this ).attr( "name" ).toLowerCase() == "description" : false;
    }).attr( "content" ) || "";

		/* Canonical */
		meta.canonical = $( "link" ).filter(function() {
    	return $( this ).attr( "rel" ) ? $( this ).attr( "rel" ).toLowerCase() == "nanonical" : false;
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
			if( parsedHREF.pathname.charAt(0) === "/" ){
				return parsedURL.protocol + "//" + parsedURL.host + parsedHREF.href;
			}

			// Include path as it was relative from the scraped file
			return parsedURL.protocol + "//" + parsedURL.host + parsedURL.pathname + parsedHREF.href;

		}

    return {
			"type"  : type,
    	"url"  	: url,
    	"meta" 	: meta
    }

	};


	// Make only the parse function accessible
	return {

		scrape : scrape

	};

};

module.exports = SiteMeta;
