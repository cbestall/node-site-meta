'use strict';

var request = require( 'request' );
var cheerio = require( 'cheerio' );

var SiteMeta = function(  ){


	var parse = function( url, callback ) {

		request( url , function (error, response, body) {
			if( error ){ return callback( error, null ); }
		  if (response.statusCode == 200) {

		    return callback( null, {
		    	url : response.request.href,
		    	meta : extractMeta( body )
		    });

		  }else{
		  	return callback( new Error( "Inalid Response" ), null );
		  }
		})
	};


	var extractMeta = function( html ) {

		var meta = {
			title 				: "",
			description		: "",
			feeds 				: [],
			og 						: {}

		}

    var $ = cheerio.load( html );

		meta.title = $( "title" ).text(  ) || "";

		meta.description = $( "meta" ).filter(function() {
    	return $( this ).attr( "name" ) ? $( this ).attr( "name" ).toLowerCase() : "" == 'description';
    }).attr( "content" ) || "";

    meta.feeds = $( "link" ).filter(function() {
    	return (/application\/.{3,4}\+xml/i).test( $( this ).attr( "type" ) );
    }).attr( "href" ) || [];

    ["title", "type", "image", "url", "description", "site_name"].forEach( function( item ) {
    	meta.og[item] = $( "meta" ).filter( function(){
    		var re = new RegExp("^og:" + item + "$", "i");
  	  	return re.test( $( this ).attr( "property" ) );
	   	}).attr( "content" ) || "";
    });

    return meta;

	};


	// Make only the parse function accessible
	return {

		parse : parse

	};

};

module.exports = SiteMeta;
