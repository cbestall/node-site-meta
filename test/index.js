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

    SiteMeta.parse( 'https://news.ycombinator.com/', function( err, o ) {
      o.should.be.an('object');
      done();
    });
    
  });
  
  
  it('should return an error for invalid URL', function (done) {
        
    SiteMeta.parse( '', function( err, o ) {
      should.exist( err );
      should.not.exist( o );
      done();
    });
    
  });  
  
  it('should return an error for a server error', function (done) {
        
    createNock( 'https://news.ycombinator.com/', 500 );
        
    SiteMeta.parse( 'https://news.ycombinator.com/', function( err, o ) {

      should.exist( err );
      should.not.exist( o );
      done();
    });
    
  });  
  
  
});

describe( "Parse Results for Valid HTML", function () {
  
  it("shoud not find a non-existent description", function ( done ) {
    
    createNock( 'https://news.ycombinator.com/', 200, 'hackernews.html' );

    SiteMeta.parse( 'https://news.ycombinator.com/', function( err, o ) {

      should.not.exist( err );
      o.description.should.equal("");
      done();
    });    
    
  });
  
  it("shoud find a feed", function ( done ) {
    
    createNock( 'https://news.ycombinator.com/', 200, 'hackernews.html' );

    SiteMeta.parse( 'https://news.ycombinator.com/', function( err, o ) {

      should.not.exist( err );
      o.feeds.should.be.instanceof(Array);
      o.feeds[0].should.equal("https://news.ycombinator.com/rss");
      done();
    });    
    
  }); 
  
  it("shoud find a title and description in mixed case tags", function ( done ) {
    
    createNock( 'http://mixedcase.com/', 200, 'mixedcase.html' );

    SiteMeta.parse( 'http://mixedcase.com', function( err, o ) {
console.log(o);
      should.not.exist( err );
      o.title.should.equal("Mixed Case Test Site");
      o.description.should.equal("A Fixture for mixed case meta tags");
      o.feeds.should.have.length.of.at.least(2);
      done();
    });    
    
  });   
  
  
});

