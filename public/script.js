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
    var globalOb = {};

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
        // render oauth info
            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                  'Authorization': 'Bearer ' + access_token
                },
                success: function (response) {
                  userProfilePlaceholder.innerHTML = userProfileTemplate(response);

                  $('#login').hide();
                  $('#loggedin').show();
                  globalOb.idme = $('.idme').text();

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
            console.log('success: ', res.id);
            $.playlist_id = res.id;
        });
        

        $('li > a').each(function (index, item) { 
            var pattern = item.text;
            var reggie = /^[^\[\(]+/;

            // pattern is processed using regex pattern
            var piece = reggie.exec(pattern)[0];

            piece = piece.replace(/-/g, '');
            piece =  piece.replace(/  /g, '+');
            piece =  piece.replace(/ /g, '+');

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
                
                $('.preview').append("<div><a href='" + unit.preview_url + "'>" 
                    + unit.name + "</a></div>"); 
            });
        });
    }

    $.reddit = function (query) {
        $.ajax('http://localhost:8888/api/' + query).done(function (data) {
            var ind = 1;
            
            data.anchors.forEach(function (anchor) {
                $('.green-light').append("<li><a href=" + anchor.link + ">" 
                    + anchor.name + "</a></li>");
                ind++;
            });
            if (data) {
                $('button.container').hide();
                console.log("Recieved : ", data); 
            }
        });
    }

    $.push = function () {
        var purl = "https://api.spotify.com/v1/users/" + $('.idme').text() 
                    + "/playlists/" + $.playlist_id + "/tracks?uris=";  
        var count = 0;
        for (var song in $.songs) {
            if (!$.songs[song])
                continue;

            var songuri = $.songs[song].uri;
            songuri = songuri.replace(/:/g, '%3A');

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
            console.log(res);
        });
    }
})();