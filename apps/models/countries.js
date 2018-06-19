// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var countrySchema = new Schema({ 
    country: {
		type: String,
		require: true,
		unique: true
	},
	frequency: {
		type: Number,
		require: true
	},
	iata: {
		type: String,
		require: true,
		unique: true
	}
});

// set up a mongoose model and pass it using module.exports
var Countries = mongoose.model('countries', countrySchema);
module.exports = Countries;
