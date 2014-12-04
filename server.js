var express = require('express'); 
var request = require('request'); 
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var https = require('https');
var cheerio = require('cheerio');

var secrets = require('./secrets.js');

var client_id = secrets.client_id; 
var client_secret = secrets.client_secret; 
var redirect_uri = secrets.redirect_uri;

var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 
  	'abcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cookieParser());

app.get("/", function (req, res) {
	res.send("./index.html");
});

app.get("/login", function (req, res) {
	var state = generateRandomString(16);
	res.cookie(stateKey, state);

	var scope = 'user-read-private user-read-email';
	res.redirect('https://accounts.spotify.com/authorize?' + 
		querystring.stringify({
			response_type: 'code',
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state
		})
	);
});


app.get("/api/:query", function (request, response) {
  // Learn to parse the other reddit pages
  var subreddit = request.params.query;

  var html = "";
  var links = [];

  var req = https.get("https://www.reddit.com/r/Music", function (res) {
    res.on('data', function (data) {
      html += data;
    });

    res.on('end', function () {
      var $ = cheerio.load(html);

      $('.linkflair-stream').each(function (index, element) {
        var anchor = $(element).find($('a.title'));
        links.push({ name: anchor.text() , link: anchor[0].attribs.href });
      });

      response.json({ anchors: links });
    });

    res.on('error', function (err) {
      console.error(err);
    });

  });

});

app.get("/callback", function (req, res) {
	var code = req.query.code || null;
	var state = req.query.state || null;

	console.log(req.cookies);
	var storedState = req.cookies ? req.cookies[stateKey] : null;

	if (state === null || state !== storedState) {
    	res.redirect('/#' +
      		querystring.stringify({
      			error: 'state_mismatch'
      		})
      	);
  	} else {
  		res.clearCookie(stateKey);
  		var authOptions = {
  			url: 'https://accounts.spotify.com/api/token',
  			form: {
  				code: code,
  				redirect_uri: redirect_uri,
  				grant_type: 'authorization_code'
  			},
  			headers: {
  				'Authorization': 'Basic ' + 
  					(new Buffer(client_id 
  						+ ':' + client_secret).toString('base64'))
  			},
  			json: true
  		}

  		request.post(authOptions, function (err, req, body) {
  			if (!err && res.statusCode === 200) {
  				var access_token = body.access_token;
  				var refresh_token = body.refresh_token;

			    var options = {
			        url: 'https://api.spotify.com/v1/me',
			        headers: { 'Authorization': 'Bearer ' + access_token },
			        json: true
				};

				request.get(options, function (err, req, body) {
					console.log(body);
				});

				res.redirect('/#' + 
					querystring.stringify({
            			access_token: access_token,
            			refresh_token: refresh_token
          			})
          		);
          		
			} else {
				res.redirect('/#' + 
					querystring.stringify({
						error: 'invalid_token'
				    })
				);
			}
  	})
  }
})

app.listen(8888);