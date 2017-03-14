//Requires & Global Vars 
require('dotenv').config();
var express = require('express');
var db = require('../models');
var passport = require('../config/passportConfig');
var router = express.Router(); 
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var getSign = require('horoscope').getSign;
var getZodiac = require('horoscope').getZodiac;
var horoscope = require('horoscope');
var horoscopeData = require('../public/js/horoscopeData');
var SpotifyWebApi = require('spotify-web-api-node');
var _ = require('lodash');
var horoScore = null; 
var valence = [];
var superSad = ['1oZNh749l4OIJYgrnpENZG', '0xLusQmpL2MWGajcw0YyXQ', '54E4j2VeN6bucTMtlP8NhD', '54X78diSLoUDI3joC2bjMz', '3QwN6nANXiVnexlOMXQNp7', '3NX3jLUU2sFQjvDRdoOvEN', '1djfA7kl7SbBhoQ2rYQITf', '621BmKwXCNiTBfmeJtxoD8', '0dBshgRgTOWzTwlacQd4aC'];
var mild = ['0QeI79sp1vS8L3JgpEO7mD', '5Fw92tQZz532B0n1LSWP2i', '0khi86hc79RfsRC0rrkkA2', '0LncTjpmLHn86PYGmWAoVf', '7en6a6ajlibz5CsLkoYAdK', '7AFxCS5OHNvZgD2qceIc5Q', '5he5lB7ZYa7EIICHn4WPOk', '1BNtFSws7fjbn9aVBPA79j', '2dBRAH9J3fL24AJkYmjZno', '3apSWeSMRsnzOAjGoVurPP', '69XTyX3ksnOsWj28Yytnym', '7dUuxR8ZgrZ6YL8rwdml1Y', '5shPZ6RnC6sCm0iSZiv7wU', '2H7PHVdQ3mXqEHXcvclTB0', '3KgByVmDzMkOXwtbqbqjBn', '6fBwVe6udYdnRqwqo06if8', '2soBvUQBf5rbMj9HIyhzzK'];
var superHappy = ['0dHvGez5CZNjiE7Z5PZfu7', '3rNCkAhv9cASYco3kC9q3D', '765k9tDIFOnoOfkO2cgitB', '4ylO0IAVZviyGLRsFgj6Nb', '4yrM5BVyJzy5Ed4GPO6e8j', '05ggCWQusGFRTaxqPh7eXP', '4iozhXt27eMl39W5z7R8H6', '2hABMU63xtaIYChN6eYlEb', '1YpgRBDgD8ed7eb8i053Qt', '7h4X53Z6RTBsLTCcmXISI3', '3olcbtUJV3xdHIfFjy8owe', '1ximT3PZHLnfYA545Iv8E9', '2fwx7cUAtsq0mnxswRfOh7', '29QOYtxStXGuGmACR2R6rJ', '31ink8UgWSYUXz0hPasoif', '51H2y6YrNNXcy3dfc3qSbA', '2nsN3TDtw5YaAJ6H7jGUla', '3IiS3fVdtsMPSHsWBgDcFn', '6Kbkge4WbvwWv1jVzSQsr8', '0wgVCOPXv9YSgmRijmDSkh', '57DZno6SOk5AjBYkoGbgJA', '1MpPRotMSsZhI5eevP2qeO', '0bNPzbyaT9npwhIP8d2Rsi', '2k96E0L0SY9raNEVMBqbVL', '6Q8s3YuAWkx0Qui0Jgkr5m', '3ZqU6tXOpZhSeMJ1Y0JpBG', '6hazdpTPlt5W2BTCGYKBoj', '0UTqMwlkHazhoNuwEBz6aJ'];


var spotifyApi = new SpotifyWebApi({
	client_id : '46c3474cdf9045198875d6a7f129e9ea', // Your client id
	client_secret : 'a0b8e89f16ec46a7b6e3ff38f803d68e', // Your secret
	redirect_uri : 'http://localhost:3000/auth/spotify/callback',
	accessToken : 'njd9wng4d0ycwnn3g4d1jm30yig4d27iom5lg4d3' 
});

//Set and Use Statements 
spotifyApi.setAccessToken('BQCPVTfcz70E-JNW5kxMWMrfPSfkpVW4ThKGCWf0TwdDyosGwL3YBvnFKsAg-2CSDmsFd3hSNLZoLC4_weNO3ZMEs90nf-53_MoPHA76BLN0A7wAGCjkrk0iio7MCAo8MkaFmsTisyEc');

//Routes
spotifyApi.getPlaylist('12135695932', '0LugNdXIsKK8eNfPNyWo8s')
  .then(function(data) {
  	var trackObj = data.body.tracks.items;
  	var trackIds = [];
  	for (var i = 0; i < trackObj.length; i++){
  		trackIds.push(trackObj[i].track.id);
  	}
	spotifyApi.getAudioFeaturesForTracks(trackIds)
	  .then(function(data) {
	  	var trackObj = data.body.audio_features;
	  	for (var i = 0; i < trackObj.length; i++){
	    valence[i] = trackObj[i].valence;
	}
	  }, function(err) {
	    done(err);
	  });
			db.user.findById(req.user.id).then(function(user){
		 	 var sign = horoscope.getSign({ month: user.birthMonth, day: user.birthDay});
		 	 var urlSign = sign.toLowerCase();
		 	 var horoApiUrl = 'http://theastrologer-api.herokuapp.com/api/horoscope/' + urlSign +'/today';
			request(horoApiUrl, function(error, response, body) {
				if (!error && response.statusCode == 200) {
		    		var horoApi = JSON.parse(body);
		    		horoScore = horoApi.meta.intensity;
		    		horoScore = horoScore.replace('%', '');
		    		horoScore = horoScore.split('');
		    		horoScore.unshift('0.')
		    		horoScore = horoScore.toString();
		    		horoScore = horoScore.replace(/,/g,"");
				} 		
				//VAR PC = 75%
				//VAR FL = 0.64
				// PC = PC.REPLACE ()
				// VAR FL2 = PARSEFLOAT(PC);
				// IF(FL2 / 100) > FL) CONsole.log('yes');
				//PC.REPLACE THEN PARSEFLOAT(PC) 
					function trackReturn(callback) {
						if (horoScore < 0.33) {
							var sadRnd = superSad[Math.floor(Math.random()*superSad.length)];
							// var sadFrame = 
							console.log('<iframe src="https://embed.spotify.com/?uri=spotify:track:' + sadRnd + '"' + " " + 'frameborder="0" allowtransparency="true"></iframe>');
							// callback(sadFrame);
						} else if (horoScore > 0.33 && horoScore < 0.66) {
							var mildRnd = mild[Math.floor(Math.random()*mild.length)];
							// var mildFrame = 
							console.log('<iframe src="https://embed.spotify.com/?uri=spotify:track:' + mildRnd + '"' + " " + 'frameborder="0" allowtransparency="true"></iframe>');
							// callback(mildFrame);
						} else if (horoScore > 0.66 && horoScore < 1) {
							var happyRnd = superHappy[Math.floor(Math.random()*superHappy.length)];
							// var happFrame = 
							console.log('<iframe src="https://embed.spotify.com/?uri=spotify:track:' + happyRnd + '"' + " " + 'frameborder="0" allowtransparency="true"></iframe>');
							// callback(happFrame);
						} else {
							console.log('oops');
						}	
						// res.send(trackReturn);
						// res.render("profile", {iframe: callback});
					}	
					trackReturn();
		  	});
		 }).catch(function(error){
		 	res.status(404).send('Something is Wrong');
		 })
		 //console.log('Some information about this playlist', data.body.tracks.items[0].track.id);
  }, function(err) {
    console.log('Something went wrong!', err);
  });


// }

//Export 
module.exports = router; 
