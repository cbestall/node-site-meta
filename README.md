# node-site-meta

Package intended to parse a site's meta data.  A simple parser, which accepts invalid tags such as mixed case attributes/properties.

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


CLI usage:

    $ site-meta http://yahoo.com http://github.com
    Scraping http://github.com: 433ms
    {...}
    Scraping http://github.com: 511ms
    {...}

