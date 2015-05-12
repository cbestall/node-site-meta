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
			feeds 				: [],
			og 						: {},
			twitter				: {}

		}

		var url = response.request.uri.href;
    var $ = cheerio.load( response.body );

		/* Title */
		meta.title = $( "title" ).text(  ) || "";
		
		var favicon = $( "link" ).filter(function () {
			 return /icon/i.test( $( this ).attr( "rel" ) );
		}).attr( "href" ) || "";
		meta.favicon = favicon.length ? constructURL( url, favicon ) : "";
		

		/* Description */
		meta.description = $( "meta" ).filter(function() {
    	return $( this ).attr( "name" ) ? $( this ).attr( "name" ).toLowerCase() == 'description' : "";
    }).attr( "content" ) || "";

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

			// Valid HREF
			if( parsedHREF.host !== null ){
				return parsedHREF.href;
			}
			
			// Missing Host, return empty string (should be error, but need to make sure handling exists)
			if( parsedURL.host === null ){
				return "";
			}
			
			if( parsedHREF.pathname.charAt(0) === '/' ){
				return parsedURL.protocol + "//" + parsedURL.host + parsedHREF.pathname;
			}
			
			return parsedURL.protocol + "//" + parsedURL.host + parsedURL.pathname + parsedHREF.pathname;

		}

    return {
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
