var should = require('chai').should();
var nock = require( "nock" );
var request = require("request");
var SiteMeta = require( '../lib/' )(  );

function createNock( url, status, file ) {
  var statusCode = status || 200;
  var scope = nock( url ).get( "/" );
  if( file ){
    scope = scope.replyWithFile( statusCode , __dirname + '/fixtures/' + file );
  }else{
    scope = scope.reply( statusCode );
  }
  return scope;
}

describe('Parse Function', function () {
  
  it('should return an object', function (done) {
        
    createNock( 'https://news.ycombinator.com/', 200, 'hackernews.html' );

    SiteMeta.scrape( 'https://news.ycombinator.com/', function( err, o ) {
      o.should.be.an('object');
      done();
    });
    
  });
  
  
  it('should return an error for invalid URL', function (done) {
        
    SiteMeta.scrape( '', function( err, o ) {
      should.exist( err );
      should.not.exist( o );
      done();
    });
    
  });  
  
  it('should return an error for a server error', function (done) {
        
    createNock( 'https://news.ycombinator.com/', 500 );
        
    SiteMeta.scrape( 'https://news.ycombinator.com/', function( err, o ) {

      should.exist( err );
      should.not.exist( o );
      done();
    });
    
  });  
  
  
});



describe( "Favicon", function () {
  
  
 it("should find favicon with just icon", function( done ) {
    
    createNock( 'http://fodors.com', 200, 'twittercards.html' );

    SiteMeta.scrape( 'http://fodors.com/', function( err, o ) {
      should.not.exist( err );
      o.meta.favicon.should.equal("http://fodors.com/favicon.png");
      done();
    });      
    
  });
  
  it("should find favicon with shortcut icon", function ( done ) {
    
    createNock( 'https://news.ycombinator.com/', 200, 'hackernews.html' );

    SiteMeta.scrape( 'https://news.ycombinator.com/', function( err, o ) {

      should.not.exist( err );
      o.meta.favicon.should.equal("https://news.ycombinator.com/favicon.ico");
      done();
    });    
    
  });  
  
  it("should not find a favicon, return blank", function ( done ) {
    
    createNock( 'http://mixedcase.com/', 200, 'mixedcase.html' );

    SiteMeta.scrape( 'http://mixedcase.com', function( err, o ) {
      should.not.exist( err );
      o.meta.favicon.should.equal("");
      done();
    });    
    
  });   
    
  
});
  

describe( "Parse Results for Valid HTML", function () {
  
  it("shoud not find a non-existent description", function ( done ) {
    
    createNock( 'https://news.ycombinator.com/', 200, 'hackernews.html' );

    SiteMeta.scrape( 'https://news.ycombinator.com/', function( err, o ) {

      should.not.exist( err );
      o.meta.description.should.equal("");
      done();
    });    
    
  });
  
  it("shoud find a feed", function ( done ) {
    
    createNock( 'https://news.ycombinator.com/', 200, 'hackernews.html' );

    SiteMeta.scrape( 'https://news.ycombinator.com/', function( err, o ) {

      should.not.exist( err );
      o.meta.feeds.should.be.instanceof(Array);
      o.meta.feeds[0].should.equal("https://news.ycombinator.com/rss");
      done();
    });    
    
  }); 
  
  it("shoud find a title and description in mixed case tags", function ( done ) {
    
    createNock( 'http://mixedcase.com/', 200, 'mixedcase.html' );

    SiteMeta.scrape( 'http://mixedcase.com', function( err, o ) {
      should.not.exist( err );
      o.meta.title.should.equal("Mixed Case Test Site");
      o.meta.description.should.equal("A Fixture for mixed case meta tags");
      o.meta.feeds.should.have.length.of.at.least(2);
      done();
    });    
    
  });   
  
  
});



describe( "Open Graph Properties", function () {
  
  it("should return title, type, image, description, and site_name", function( done ) {
    
    createNock( 'http://mixedcase.com/', 200, 'mixedcase.html' );

    SiteMeta.scrape( 'http://mixedcase.com', function( err, o ) {
      
      should.not.exist( err );
      o.meta.og.title.should.equal("Open Graph Title");
      o.meta.og.type.should.equal("Open Graph Type");
      o.meta.og.url.should.equal("http://mixedcase.com/og");
      o.meta.og.site_name.should.equal("Mixed Case OG");
      o.meta.og.description.should.equal("");
      done();
    });      
    
  });
  
  it("should return empty title, type, image, description, and site_name", function( done ) {
    
    createNock( 'https://news.ycombinator.com/', 200, 'hackernews.html' );

    SiteMeta.scrape( 'https://news.ycombinator.com/', function( err, o ) {
      
      should.not.exist( err );
      o.meta.og.title.should.equal("");
      o.meta.og.type.should.equal("");
      o.meta.og.url.should.equal("");
      o.meta.og.description.should.equal("");
      o.meta.og.site_name.should.equal("");
      done();
    });      
    
  });  
  
});


describe( "Twitter Properties", function () {
  
  
 it("should return twitter card information", function( done ) {
    
    createNock( 'http://fodors.com', 200, 'twittercards.html' );

    SiteMeta.scrape( 'http://fodors.com/', function( err, o ) {

      should.not.exist( err );
      o.meta.twitter.title.should.equal("America's Best Small Towns");
      o.meta.twitter.description.should.equal("For the second year in a row, we've compiled a list that highlights some of the best places in the country you don't hear about every day.");
      o.meta.twitter.url.should.equal("http://www.fodors.com/news/photos/americas-best-small-towns");
      done();
    });      
    
  });  
    
  
});
  

