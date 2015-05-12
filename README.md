# node-site-meta

Package intended to parse a site's meta data.  A simple parser, which accepts invalid tags such as mixed case attributes/properties.

Installation:

    $ npm install site-meta

Example usage:

    var SiteMeta = require( 'site-meta' )(  ); // Initialize

    SiteMeta.scrape( 'http://github.com', function( err, meta ){
        if( !err ) console.log( meta );
    });

This will return an object

    {   url : String,
        meta : {
            title: String
            description: String
            feeds : Array,
            favicon : String,
            og : {
                title: String,
                type: String,
                image: String,
                url: String,
                description: String,
                site_name: String
            },
            twitter : {
                card: String,
                site: String,
                title: String,
                url: String,
                description: String,
                creator: String,
                image: String
            }
        }
    }


Unit Tests

    $ npm install // Install Dev Dependencies

    $ npm test // Runs Tests