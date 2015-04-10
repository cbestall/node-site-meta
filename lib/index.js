'use strict';

var request = require( 'request' );
var cheerio = require( 'cheerio' );

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

		/* Description */
		meta.description = $( "meta" ).filter(function() {
    	return $( this ).attr( "name" ) ? $( this ).attr( "name" ).toLowerCase() == 'description' : "";
    }).attr( "content" ) || "";

		/* Feeds */
    meta.feeds = $( "link" ).filter(function() {
    	return (/application\/.{3,4}\+xml/i).test( $( this ).attr( "type" ) );
    }).map(function ( index, item ) {
    	var feed = $( item ).attr( "href" );
    	if ( !(/^https?:\/\//i).test( feed ) ){
    		return url + feed;
    	}
    	return feed;
    }).get();


		/* Open Graph */    
		meta.og = parseGraphContent( "og", "property", ["title", "type", "image", "url", "description", "site_name"] );

// :image0
// :image1
// :image2

		/* Twitter */
    meta.twitter = parseGraphContent( "twitter", "name", ["card", "site", "title", "url", "description", "image"] );


		function parseGraphContent( graphtype, attr, itemArray ) {
	
			var graphContent = {};
	
	    itemArray.forEach( function( item ) {
	    	graphContent[item] = $( "meta" ).filter( function(){
	    		var re = new RegExp("^" + graphtype + ":" + item + "$", "i");
	  	  	return re.test( $( this ).attr( attr ) );
		   	}).attr( "content" ) || "";
	    }); 
	    console.log(graphContent);
	    return graphContent;
			
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
