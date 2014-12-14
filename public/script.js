(function () {
	function getHashParams() {
		var hashParams = {};
		var e, r = /([^&;=]+)=?([^&;]*)/g,
		  	q = window.location.hash.substring(1);
		while ( e = r.exec(q)) {
		 	hashParams[e[1]] = decodeURIComponent(e[2]);
		}
		return hashParams;
    }

    var userProfileSource = 
        document.getElementById('user-profile-template').innerHTML;
    var userProfileTemplate = Handlebars.compile(userProfileSource);
    var userProfilePlaceholder = document.getElementById('user-profile');

    var params = getHashParams();

	var access_token = params.access_token
		refresh_token = params.refresh_token,
		error = params.error;

	if (error) {
      alert('There was an error during the authentication');
    } else {
        if (access_token) {
        // once the access token is recieved we need to get some information about
        // the user -- we can do this by querying the me endpoint 
            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                success: function (response) {
                  userProfilePlaceholder.innerHTML = userProfileTemplate(response);

                  $('#login').hide();
                  $('#loggedin').show();
                  $('#create').hide();

                  $.reddit();
                }
            });
        } else {
          // render initial screen
          $('#login').show();
          $('#loggedin').hide();
        }
    }
    
    $.search = function () {
        $.songs = {};
        
        var date = new Date();
        date = date.toLocaleString();

        $.ajax({
            url: 'https://api.spotify.com/v1/users/' 
                + $('.idme').text() + '/playlists',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            data: '{ "name": "r/Music ' + date + '" }'
        }).done(function (res) {
            $.playlist_id = res.id;
            $('#search').hide();
            $('#create').show();
        });
        

        $('li > a').each(function (index, item) { 
            var pattern = item.text;
            var reggie = /^[^\[\(]+/;
            var kid = $(this);
            // pattern is processed using regex pattern
            var piece = reggie.exec(pattern)[0];

            piece = piece.replace(/-/g, '');
            piece = piece.replace(/  /g, '+');
            piece = piece.replace(/ /g, '+');

            $.ajax({
                url: 'https://api.spotify.com/v1/search?q=' 
                    + piece + '&type=track',
                type: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                }
            }).done(function (res) {
                var unit = res.tracks.items[0];
                $.songs[piece] = unit;

                if (unit)
                    kid.addClass("accepted");
            });
        });
    }

    $.reddit = function (query) {
        // Due to XSS (Cross Site Scripting) exploit we must hand the web-scraping 
        // action to the server, 
        // once the   
        $.ajax('http://localhost:8888/api/' + query).done(function (data) {
            var ind = 1;
            
            data.anchors.forEach(function (anchor) {
                $('.green-light').append("<li><a href=" + anchor.link + ">" 
                    + anchor.name + "</a></li>");
                ind++;
            });

            if (data) {
                $('button.container').hide();
            }
        });
    }

    $.push = function () {
        var purl = "https://api.spotify.com/v1/users/" + $('.idme').text() 
                    + "/playlists/" + $.playlist_id + "/tracks?uris=";  
        var count = 0;

        // create one gigantic url that has all the song uris since firing a request
        // for each song was not stable :P
        for (var song in $.songs) {
            if (!$.songs[song])
                continue;

            // encode the songuris ** encodeURI was not working so do this manually
            var songuri = $.songs[song].uri;
            songuri = songuri.replace(/:/g, '%3A');

            // spotify takes songs in this format:
            // POST /tracks?uris=spotify%3Atracks%3Aaldkfj,spotify%3Atracks%3Aetcetc
            if (count > 0)
                purl += ',' + songuri;
            else 
                purl += songuri;

            count++;
        }
        
        $.ajax({
            type: 'POST',
            url: purl,
            headers: {
                'Authorization': 'Bearer ' + access_token
            }
        }).done(function (res) {
            $('#create').hide();
        });
    }
})();