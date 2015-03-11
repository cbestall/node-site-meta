# node-site-meta

Package intended to parse a site's meta data.  A generous parser, which accepts invalid tags such as mixed case names.

Example usage:

    var SiteMeta = require( 'site-meta' )(  ); // Initialize

    SiteMeta.parse( 'http://google.com', function( err, meta ) { if( !err ) console.log( meta ); } );

This will return an object

    {   url : String,
        meta : {
            title: String
            description: String
            feeds : Array
            og : {
                title: String,
                type: String,
                image: String,
                url: String,
                description: String,
                site_name: String
            }
        }
    }

  
  
 
