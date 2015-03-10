var nock = require( "nock" );
var request = require("request");
var SiteMeta = require( '../lib/' )(  );

var scope = nock('https://news.ycombinator.com/')
                .get('/')
                // .reply(200, 'Hello from Google!');
                .replyWithFile(200, __dirname + '/fixtures/hackernews.html');


SiteMeta.parse( 'https://news.ycombinator.com/', function(err, s) {console.log( s );} );
// request("https://news.ycombinator.com/",function (error, response, body) {
  // console.log(error);
  // console.log(response);
//   console.log(body);
// })