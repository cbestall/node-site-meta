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

describe( "Parse Results", function () {
  
  it("shoud not find a description", function ( done ) {
    
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
  
  it("shoud find a title", function ( done ) {
    
    createNock( 'https://news.ycombinator.com/', 200, 'hackernews.html' );

    SiteMeta.parse( 'https://news.ycombinator.com/', function( err, o ) {

      should.not.exist( err );
      o.title.should.equal("Hacker News");
      done();
    });    
    
  });   
  
  
});



// request("https://news.ycombinator.com/",function (error, response, body) {
  // console.log(error);
  // console.log(response);
//   console.log(body);
// })