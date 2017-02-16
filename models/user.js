var mongoose        = require("mongoose");

//ADDED FOR AUTHENTICATION
var passportLocalMongoose   = require ("passport-local-mongoose");

var kyraUserSchema = new mongoose.Schema({
     username: String, 
    // username: String,
     password:String,
    //password2 :String,
     password2:String,
     phone:Number,
     firstname:String,
     lastname:String
     
  });
  
  //ADDED TO INCLUDE ALL AUTHENTICATION METHOD INTO SCHEMA
  kyraUserSchema.plugin(passportLocalMongoose );
  
  
 module.exports  = mongoose.model("kyraUser",kyraUserSchema);