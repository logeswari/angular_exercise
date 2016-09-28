/**
 * http://usejsdoc.org/
 */
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:12345/angular_exercise');
var Schema = mongoose.Schema;

var customerSchema = new Schema({
	  userName : String,
	  name: String,
	  age : Schema.Types.Mixed,
	  city : String,
	  email : String,
	  country : String,
	  postalCode : String,
	  latitude : String,
	  longitude : String,
	  phoneNumber : String,
	  createdTime : String,
	  createdTimeStamp : String,
	  type : String,
	  tag : [{
		  id : Number,
		  field : String,
		  description : String	  
	  }]
	});

var Customer = mongoose.model('customers', customerSchema);

module.exports = Customer;



