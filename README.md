# node-site-meta

Package intended to parse a site's meta data.  A generous parser, which accepts invalid tags such as mixed case names.

Example usage:

    var SiteMeta = require( '../lib/' )(  );

    SiteMeta.parse( 'http://google.com', function( err, meta ) { if( !err ) console.log( meta ); } );

This will return an object

    {   url,
        meta : {
            title
            description
            feeds (rss and atom)
            og (open graph)
        }
    }

  
  
 
