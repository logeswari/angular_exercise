
/*
 * GET users listing.
 */
var Customer = require('../models/customer.js');
var dummyjson = require('dummy-json');
var async = require('async');
var moment = require('moment');
var _ = require('underscore');

var fs = require('fs');

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.customerList = function(req,res){
	
	var query = {};
//	if(req.query.filters && req.query.filters.length > 0){
//		if(typeof req.query.filters == "string"){
//			req.query.filters = [req.query.filters]
//		}
//		var newExist = _.contains(req.query.filters, "New");
//		var oldExist = _.contains(req.query.filters, "Old");
//		var errorExist = _.contains(req.query.filters, "Error");
//		var missedExist = _.contains(req.query.filters, "Missed");
//		
//		var start = new Date(moment().startOf('day')).getTime()
//		
//		if(newExist && oldExist){
//			// Do Nothing
//		
//		}else if(newExist){
//			query.createdTimeStamp = {$gte : start}
//		}else if(oldExist){
//			query.createdTimeStamp = {$lte : start}
//		}
//		
//		if(errorExist && missedExist){
//			query["tag.id"] = {$in : [1,2]}
//		}else if(errorExist){
//			query["tag.id"] = 1
//		}else if(missedExist){
//			query["tag.id"] = 2
//		}
//	};
	
	Customer.find(query, function(err, customers) {
		
		  if (!err) {
			  var data = {
					  customers :   customers
			  }
			  res.send(data);
		  }else{
			  res.send(err)
		  }
		  
		});
}

exports.getRandomJson = function(req,res){
	
	var template = fs.readFileSync('routes/template.hbs', {encoding: 'utf8'});
	var result = dummyjson.parse(template);

	var resJson = JSON.parse(result);
	
	convertJson(resJson.customers,function(err,response){
		res.setHeader('content-type', 'application/json');
		var data = {
				customers : response
		}
		res.json(data)
	})
	
}

var convertJson = function(resJson,clbk){
	var response = [];
	async.each(resJson,function(obj,callback){
		
		if(obj){
			async.parallel({
				getUserName : function(cbk){
					if(obj.firstName && obj.lastName){
						obj.userName = obj.firstName[0]+obj.lastName
					}else if(obj.firstName){
						obj.userName = obj.firstName
					}else if(obj.lastName){
						obj.userName = obj.lastName
					}
					
					cbk(null,null)
				},
			    getName: function(cbk) {
			    	if(obj.firstName && obj.lastName){
						obj.name = obj.firstName +" "+obj.lastName;
					}else if(obj.firstName){
						obj.name = obj.firstName
					}else if(obj.lastName){
						obj.name = obj.lastName
					}
			    	cbk(null,null)
			    },
			    removeFnameLname : function(cbk){
			    	delete obj.firstName;
			    	delete obj.lastName;
			    	cbk(null,null)
			    },
			    formatPhone : function(cbk){
			    	obj.phoneNumber = "+1 "+obj.phoneNumber;
			    	cbk(null,null)
			    },
			    formatLatLng : function(cbk) {
			    	obj.latitude = Math.round(obj.latitude * 1000) / 1000
			    	obj.longitude = Math.round(obj.longitude * 1000) / 1000
			    	cbk(null,null)
			    },
			}, function(err, results) {
				response.push(obj)
				callback(null,null)
			});
		}
		
	},function(err){
		clbk(null,response)
	})
}

exports.postJsonData = function(req,res){
	var result = {};
	if(req.body){
		var userNameArray = [];
		async.each(req.body,function(obj,callback){
			userNameArray.push(obj.userName)
			obj.createdTime = moment(new Date().getTime()).format('DD/MM/YYYY hh:mm A');
			obj.createdTimeStamp = new Date().getTime();
			
			
			validateData(obj,function(err,object){
				object.type = "";							
				
				Customer.find({userName : new RegExp(obj.userName, "i")}, function(err, custArray) {						
					if(custArray && custArray.length > 0){						
						object.type = "Old";
						console.log(custArray[0]._id)

						Customer.update({"_id":custArray[0]._id},object,function(err, updatedVal) {
							console.log("updatedVal ...")
							console.log(updatedVal)
							  if (err) {
								  console.log("err in update")
								  console.log(updatedVal)
							  }
							  callback(null)
							});
						
					}else{
						object.type = "New";
						var cust = new Customer(object);

						cust.save(function(err) {
							if(err)
								{
								console.log(err)
								}
							callback(null)
						});
					}			
				});				
				
			})
			
		},function(err){
			 Customer.update({userName : {$nin : userNameArray }},{ $set: { type: "Missed"}}, { multi: true }, function (err, updated) {
				 console.log("err......")
				 console.log(err)
				 console.log("updated.....")
				 console.log(updated)
				res.send(result)
			 });
		})
	}else{
		res.send(result)
	}
}

var validateData = function(obj,callback){
	if(obj){
		var valid = true
	    var tag = [];
		obj.description = "null";
		async.series({
			checkUserName : function(cbk){
				if(obj.userName){
					cbk(null,null)					
				}else{
					valid = false;
					tag.push(tags.tag2["0"])
					cbk(null,null)
				}
			},
			checkName : function(cbk){
				if(obj.name){
					cbk(null,null)
				}else{
					valid = false;
					tag.push(tags.tag2["1"])					
					cbk(null,null)
				}
			},
			checkPhone : function(cbk){
				if(obj.phoneNumber){
					var re =/([0-9\s\-]{7,})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?$/;
					var phoneValid = re.test(obj.phoneNumber);
					if(phoneValid){
						cbk(null,null)
					}else{
				    	valid = false;
						tag.push(tags.tag1["1"])
				    	cbk(null,null)
				    }	
				}else{
					valid = false;
					tag.push(tags.tag2["2"])
					cbk(null,null)
				}
			},
			checkEmail : function(cbk){
				if(obj.email){
				    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				    var emailValid = re.test(obj.email);
				    if(emailValid){
				    	cbk(null,null)
				    }else{
				    	valid = false;
						tag.push(tags.tag1["2"])
				    	cbk(null,null)
				    }
				}else{
					valid = false;
					tag.push(tags.tag2["3"])					
					cbk(null,null)
				}
			},
		}, function(err, results) {
			obj.tag = tag;
			callback(null,obj)
		});
	}else{
		callback(null,obj);
	}
}

var tags = {
	"tag1" : {
		"0":{
			id : 1,
			field : "userName",
			description : "Username already exist"
		},
		"1":{
			id : 1,
			field : "phoneNumber",
			description : "Invalid Phone Number"
		},
		"2":{
			id : 1,
			field : "email",
			description : "Invalid Email"
		},
	},
	"tag2" : {
		"0":{
			id : 2,
			field : "userName",
			description : "Username cannot be empty"
		},
		"1":{
			id : 2,
			field : "name",
			description : "Name cannot be empty"
		},
		"2":{
			id : 2,
			field : "phoneNumber",
			description : "Phonenumber cannot be empty"
		},
		"3":{
			id : 2,
			field : "email",
			description : "Email cannot be empty"
		}
	}		
}