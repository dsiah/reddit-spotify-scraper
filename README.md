reddit-spotify-scraper
======================

A crude web scraping bot that will fetch the frontpage of r/Music. It will fetch all the youtube links (and therefore no articles) in order to find songs to add to the playlist and then allow you to create the playlist in your spotify account.

You will need to use npm to install all dependencies.

```npm install```

Also, you must have app credentials (register an app on Spotify developers) to access the spotify api as well as allow users to login using their spotify accounts.
then take those creditials and create a secrets.js file which contains a single json object formatted like this:

```javascript

module.exports = {
	client_id : /* your client id (String) */, 
	client_secret : /* your client secret (String) */,
	redirect_uri : /* your callback url (String) */
}

```

Place this file in the <b>ROOT</b> directory
