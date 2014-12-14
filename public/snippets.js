// snippets to use

// Here is the selector that will grab all the 
// sentences to perform RegEx on

$('li > a').each(function (index, item) { 
	var pattern = item.text;
	var reggie = /^[^\[\(]+/;

	// pattern is processed using regex pattern
	console.log(reggie.exec(pattern)); 
});

$.ajax({
	url: 'https://api.spotify.com/v1/search'
});

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

$.search = function (query) {
    var search = query.replace(/-/g, '');
    search = search.replace(/ /g, '+');

    return search;
    /*

    $.ajax({
        url: 'https://api.spotify.com/v1/search',
        headers: {
            'Authorization': 'Bearer ' + access_token 
        },
        success: function (response) {

        }
    });

    */
}