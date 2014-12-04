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

    var userProfileSource = document.getElementById('user-profile-template').innerHTML;
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
            	  //fetchplaylists(globalOb.idme);
                }
            });
        } else {
          // render initial screen
          $('#login').show();
          $('#loggedin').hide();
        }
    }

    /*
    function fetchplaylists (idme) {
        if (access_token) {
        	$.ajax({
        		url: 'https://api.spotify.com/v1/users/' + idme + '/playlists',
        		headers: {
        			'Authorization': 'Bearer ' + access_token
        		},
        		success: function (response) {
        			console.log(response);
        			//$('.green-light').text(JSON.stringify(response));
                    for (var list in response.items) {
                      $('.green-light').append("<p class='text-center'>" + response.items[list].name + "</p>");
                    }
        		}
        	});
        } 
	}
    */

    $.reddit = function (query) {
        $.ajax('http://localhost:8888/api/' + query).done(function (data) {
            var ind = 1;
            
            data.anchors.forEach(function (anchor) {
                $('.green-light').append("<li><a href=" + anchor.link + ">" + anchor.name + "</a></li>");
                ind++;
            });
            if (data) {
                $('button.container').hide();
                console.log("Recieved : ", data); 
            }
        });
    }

})();