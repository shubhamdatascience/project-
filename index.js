var http = require('http');
var express     = require('express');
var app         = express();
var mongoose    = require('mongoose');
mongoose.Promise = global.Promise;
var Twitter = require('twitter');
var SabreDevStudio = require('sabre-dev-studio');
var Countries = require('./apps/models/countries'); // get our mongoose model
var config = require('./includes/config'); // get our config file
var request = require("request");

connection = mongoose.connect(config.database);

var client = new Twitter({
  consumer_key: config.consumer_key,
  consumer_secret: config.consumer_secret,
  access_token_key: config.access_token_key,
  access_token_secret: config.access_token_secret,
  /*request_options: {
    proxy: 'http://web-proxy.in.hpicorp.net:8080'
  }*/
});

/* var sabre_dev_studio = new SabreDevStudio({

    client_id:     config.client_id,
    client_secret: config.client_secret,
    access_token : config.access_token,
    uri:           'https://api.havail.sabre.com'
});*/

var max_country_freq = 0;
var max_country_freq_name = '';
var max_country_freq_iata = '';

var all_countries = {
		'Egypt': {'freq':0, 'iata': 'CAI'},
		'Morocco': {'freq':0, 'iata': 'CMN'},
		'Nigeria': {'freq':0, 'iata': 'ABV'},
		'Senegal': {'freq':0, 'iata': 'DKR'},
		'Tunisia': {'freq':0, 'iata': 'TUN'},
		'Australia': {'freq':0, 'iata': 'CBR'},
		'Iran': {'freq':0, 'iata': 'IKA'},
		'Japan': {'freq':0, 'iata': 'HND'},
		'Korea': {'freq':0, 'iata': 'ICN'},
		'Saudi': {'freq':0, 'iata': 'RUH'},
		'Belgium': {'freq':0, 'iata': 'BRU'},
		'Croatia': {'freq':0, 'iata': 'DBV'},
		'Denmark': {'freq':0, 'iata': 'CPH'},
		'England': {'freq':0, 'iata': 'LHR'},
		'France': {'freq':0, 'iata': 'CDG'},
		'Germany': {'freq':0, 'iata': 'FRA'},
		'Iceland': {'freq':0, 'iata': 'KEF'},
		'Poland': {'freq':0, 'iata': 'WAW'},
		'Portugal': {'freq':0, 'iata': 'LIS'},
		'Russia': {'freq':0, 'iata': 'SVO'},
		'Serbia': {'freq':0, 'iata': 'BEG'},
		'Spain': {'freq':0, 'iata': 'MAD'},
		'Sweden': {'freq':0, 'iata': 'ARN'},
		'Switzerland': {'freq':0, 'iata': 'ZRH'},
		'Costa': {'freq':0, 'iata': 'SJO'},
		'Mexico': {'freq':0, 'iata': 'CUN'},
		'Panama': {'freq':0, 'iata': 'PTY'},
		'Argentina': {'freq':0, 'iata': 'EZE'},
		'Brazil': {'freq':0, 'iata': 'GIG'},
		'Colombia': {'freq':0, 'iata': 'BOG'},
		'Peru': {'freq':0, 'iata': 'LIM'},
		'Uruguay': {'freq':0, 'iata': 'MVD'}
	}
	
var country_names = Object.keys(all_countries);

function storeDB(co) {
	Countries.findOne({country: co}, function(err, country) {
		if(err) {
			console.log(err);
		} else if (country==null) {
			var newCountry = new Countries({
				country: co,
				frequency: all_countries[co]['freq'],
				iata: all_countries[co]['iata']
			});
			
			newCountry.save(function(err) {
				if (err) {
					console.log(err);
				}
			});
		} else {
			freq = country.frequency;
			new_freq = freq + all_countries[co]['freq'];
			country.frequency = new_freq;
			country.save();
		}
	});
}

app.get('/gettweets', function(req,res) {
	//Getting the Tweets
	client.get('search/tweets', {q: 'fifa', lang: 'en', count: 100}, function(error, tweets, response) {
		
		// Storing the frequency of countries
		for(i=0; i<tweets.statuses.length; i++) {
			tweet_text = tweets.statuses[i].text.toLowerCase()
		
			for(j=0; j<country_names.length; j++) {
				if(tweet_text.indexOf(country_names[j].toLowerCase())!=-1) {
					all_countries[country_names[j]]['freq'] = all_countries[country_names[j]]['freq'] + 1;
				}
			}
		}
		
		// Storing the frequency of countries in MongoDB.
		country_names = Object.keys(all_countries);
		for(var i=0; i<country_names.length; i++) {
			storeDB(country_names[i]);
		}
		
		res.json({error:false, countries: all_countries});

	});
});

app.get('/getflights', function(req,res) {
	//Getting the Tweets
	Countries.find({}, function(err, countries) {
		for(i=0; i<countries.length;i++) {
			if(countries[i].frequency>max_country_freq) {
				max_country_freq = countries[i].frequency;
				max_country_freq_name = countries[i].country;
				max_country_freq_iata = countries[i].iata;
			}
		}
		/*sabre_dev_studio.get('/' + max_country_freq_iata, function(err,data) {
			if(err) {
				console.log(err);
			} else {
				res.json(data);
			}
		});*/
        var options = { method: 'GET',
            url: 'https://api-crt.cert.havail.sabre.com/v1/shop/flights/cheapest/fares/' + max_country_freq_iata,

//            url: 'https://api-crt.cert.havail.sabre.com/v1/shop/flights/cheapest/fares/SVO',
            headers:
                { 'postman-token': 'dd99549a-c211-551c-44ac-d5dcccb7d0a1',
                    'cache-control': 'no-cache',
                    authorization: 'Bearer T1RLAQKQIa38PIYhNWqdIaMFR05/TeMIqhAFFlUiJxyXRvA7wWijRkYEAADAcUM2zBtDmU5nQNNTVGSOcpI7T+M0oRZ1QutzbB0WgeubmBptjeIfnKN///j6GfvHb27lLbPhGdpYa4a5jfBO3gT2P7Y2wEPbb1t2yo7jGid5Y0mG144byp0+KNprhBQD4Ags97ZwKaP5Cl0tscSFlHPl6XOH+VspGOcX8SH3RVOLnwF83PRQlTb7BjYG7/uTxlcV8JD/5hngr6OzV1MKKUqCd73Mgra2a9eSUrD+71o1ce7iCRYeQaM5yRb27sLr' } };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            res.json(body);
        });
	});

});


var port = process.env.PORT || 3000; // used to create, sign, and verify tokens
app.listen(port);
console.log('Magic happens at http://localhost:' + port);