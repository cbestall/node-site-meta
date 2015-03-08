var SiteMeta = require( '../lib/' )(  );

SiteMeta.parse( 'http://google.com', function(err, s) {console.log( s );} );
SiteMeta.parse( 'http://tigernet.com', function(err, s) {console.log( s );} );
SiteMeta.parse( 'https://github.com/cheeriojs/cheerio', function(err, s) {console.log( s );} );
SiteMeta.parse( 'https://digitalocean.com/blog', function(err, s) {console.log( s );} );