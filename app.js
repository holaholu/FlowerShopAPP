// Main initialize ========================================
var express         = require ("express");
var app             = express();
var bodyParser      = require("body-parser");
var mongoose        = require("mongoose");
var methodOverride  = require("method-override");
var expressSanitizer= require("express-sanitizer");
var flash           = require("connect-flash");
var cookieParser    = require('cookie-parser');
var request         = require('request');
var townshipEmail  = require('township-email')

//var url             = process.env.APP1URL || "mongodb://localhost/APP1";
var url             = "Your MongoLink" ;

//======================================================================


var kyraUser         = require("./models/user");


//==========================SESSION=======


app.use(require("express-session")({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
//========================================







//==========Require Model===================

 
 mongoose.connect(url);


app.use(bodyParser.urlencoded({extended: true})); //// Create application/x-www-form-urlencoded parser
app.use(expressSanitizer ());
app.use (express.static("public"));
app.use(methodOverride("_method"));
app.set("view engine","ejs");
app.use(flash());
app.use(cookieParser());




//For exception/errors========

process.on('uncaughtException', function(code) {
  console.log('Some Error Happened: We will fix soon' );

});


//====================================

//Authentication Config
//========================================================
var passport                    = require("passport"),
    LocalStrategy               = require("passport-local"),
    passportLocalMongoose       = require ("passport-local-mongoose");
   



app.use(passport.initialize());
app.use(passport.session());

// DEFINE USER MODEL BEFORE USING BELOW:
 passport.use(new LocalStrategy(kyraUser.authenticate()));
 passport.serializeUser(kyraUser.serializeUser());
 passport.deserializeUser(kyraUser.deserializeUser());

//=============================================================



//VARIABLES MADE AVAILABLE TO ALL TEMPLATES=====================

app.use(function(req,res,next){
    res.locals.currentuser=req.user;
    res.locals.error      =req.flash("error");
    res.locals.success    =req.flash("success");
    next();
});





//===========================API========================



// =====EMAIL SENDING SECTION================
var mail = townshipEmail({
  transport: `smtps://${process.env.GMAIL_USER}%40gmail.com:${process.env.GMAIL_PASS}@smtp.gmail.com`,
 
  emails: {confirm:sender,welcome:pass}
})
var mail2 = townshipEmail({
  transport: `smtps://${process.env.GMAIL_USER}%40gmail.com:${process.env.GMAIL_PASS}@smtp.gmail.com`,
 
  emails: {confirm:signtime,welcome:sales}
})

function sender (options) {
  return `<div>
  
    <p>Customer name:  ${options.name}</p>
    <p>Customer email:  ${options.from}</p>
    <p>Customer Phone:  ${options.phone}</p>
    <p><b>Subject:  ${options.subject}</b></p>
    <p>Message:  ${options.message}</p>
     </div>`
}

function pass (options) {
  return `<div>
  
  
    <p>Email :  ${options.email}</p>
    <p>Password :  ${options.password}</p>
    <p></p><br>
  
    <p>Thank you for using our services. </p>
     </div>`
}

function signtime (options) {
  return `<div>
  
  
    <p>Hello,  ${options.name.toUpperCase()}.</p><br>
    <p> We are delighted to have you signup on our website. </p
    
    
  
    <p>Your login details are: </p>
    <p>Email: ${options.username} </p>
    <p>Password: ${options.password2} </p><br><br>
     </div>`
}


function sales (options) {
  return `<div>
  
 

    <p> ${options.name} order has been made from your site</p>
    <p>Confirm that you are credited ASAP</p>
    <p></p><br>
  
    <p> </p>
    <p><a href="https://www.floristone.com/affiliate/aff_manager/index.cfm?fuseaction=main">FloristOne Affiliate Login</a>....</p>
     </div>`
}


//==========================================

app.get("/", function(req,res){
    
    res.render("index");
   
    console.log(req.ip);
  
});





app.get("/contact", function(req,res){
   
    res.render("contact");
  
});



app.get("/privacy", function(req,res){
   
  
    res.render("privacy");
   
});


app.get("/terms", function(req,res){
   
  
    res.render("terms");
   
});

app.get("/about", function(req,res){
   
  
 
    res.render("about");
   
});



app.get("/login", function(req,res){
	
    
    res.render("login");
});




app.post("/login",passport.authenticate("local",{ 
      successRedirect :"/flowershop/ao/1",
      failureRedirect: "/login" }),function(req,res){ });
      
      
app.get("/logout",function(req,res){
  req.logout();
  //req.flash("success","You have successfully logged out !");
  res.redirect("/flowershop/ao/1");
});


app.get("/signup", function(req,res){
    
    res.render("signup");
});



app.post("/signup",function(req,res){
    
  var password=req.body.password;
  var password2=req.body.password2;
  
  var firstname=req.body.firstname;
  var lastname=req.body.lastname;
  var phone=req.body.phone;
  var username=req.body.username;
  
  if (password==password2) {
      
      
  

           
     // save/register user details and authenticate for instant login
  kyraUser.register(new kyraUser({username:username,firstname:firstname,password2:password2,lastname:lastname,phone:phone}),password,function(err,user){  //use of keyword "username is important"
      if (err){
          //req.flash("error",err.message); // helps with flashing the exact message from passport.
          
          return res.redirect("/signup"); 
      }else {
      	
         
           passport.authenticate("local")(req,res,function(){
               
               //res.redirect("/flowershop/ao/1");
              
               
                    mail2.confirm({
                                  name:firstname,
                                  password2:password2,
                                  username:username,
                                  subject:"Welcome to Florist Lola",
                                  to:username
                                }, function (err) {
                                  if (err){res.send(err);console.log(err);
                                }else { res.redirect("/flowershop/ao/1")}})

           	
           	
           
            
             
           	
           });
      }
  });
  }else{
      res.render("passres");
  }
});






app.post("/contact", function(req,res){

 var name= req.body.name;
 var email= req.body.email;
 var subject= req.body.subject;
 var message= req.body.message;
 var phone= req.body.phone;
 
   
mail.confirm({
  name: name,
  from: email,
  subject: subject,
  message:message,
  phone:phone,
  to: "youremail"//replace this with the florist on email when ready
}, function (err) {
  if (err){res.send(err);console.log(err);
}else {res.render("contactres")}})



});




app.post("/forgotpassword", function(req,res){
    var email = req.body.email;
    console.log(email);
    
    kyraUser.findByUsername(email,function(err,body){
     if (err){
         console.log(err);
     }else{
         
         if (body==null){
             res.render("wrongloginres");
             console.log(body);
         }else{
         console.log(body);
          var password=body.password2;
          
            mail.welcome({
                  
                  email:email,
                  password:password,
                  to: email
                }, function (err) {
                  if (err){res.send(err);console.log(err);
                }else {res.render("loginres")}})

          
          
         //console.log(body.password2);
       
         }  
     }
     
 });
    
    
    
 }); 
 
 
 
 

app.get("/forgotpassword", function(req,res){
    res.render("forgotpassword");
   
});





app.get("/messages", function(req,res){
    
    res.render("messages")
});


app.post("/giftbasketorder", function(req,res){
    var date=req.body.date;
    var code=req.body.code;
    var index=req.body.index;
     
    
    var products=[{"code":code,"deliverydate":date,"rpa":5}];
    products=JSON.stringify(products);
   
    
     var total2 ="https://www.floristone.com/api/rest/giftbaskets/gettotal?products="+products;
    
    //=======================================
    
       // API authentication credentials(GIFTBASKET)============
    var username2 = " username",
    password2 = "password",
    auth2 = "Basic " + new Buffer(username2 + ":" + password2).toString("base64");
    //=======================================
   
  

request.get(
    {
        url : total2,
        headers : {
            'content-type' : 'application/x-www-form-urlencoded',
            "Authorization" : auth2//||auth,
            
          
        },
        
    },
    function (errors, response, body) {
      if (errors){
            console.log(errors);
           
       
    }
    else {
        if ( response.statusCode == 200) {
        var parsedata = JSON.parse(body);
       //console.log(parsedata);
       
       
   res.render("gifttotal",{itemtotal:parsedata,date:date,index:index});
    
        }
    
    }});
    
    
    
    
    
   
});



app.post("/orderpage", function(req,res){
    var billdetails = req.body.billdetails;
    var summary =req.body.summary;
    var totalorder= req.body.totalorder;
   
   var mysales=[];
   
      //console.log(billdetails);
     //console.log(summary[1]["GIFTCOST"]);
     
     
     
     var customer= "code as needed";
     
      var ccinfo = "code as needed";
     });
     
     
        //First Extract the flowerShop item into the variable flower
            var flower =[];
            var giftbasket =[];
            for (var k=0; k<summary.length; k++){
                if (summary[k]["DIMENSION"]=='') {
                    giftbasket.push(summary[k])
                    
                }else {flower.push(summary[k]); }
                
                
            }
          
            //===========End of Flower Shop Extraction================
     
     
 
     
     for(var s=0; s<summary.length;s++) {
         
         switch(summary[s]["ALLOWSUBSTITUTIONS"]){
     case("1"):
         summary[s]["ALLOWSUBSTITUTIONS"]="Yes";
         break;
    case(""): 
        summary[s]["ALLOWSUBSTITUTIONS"]="No";
         break;
     }}
     
     
     
   // Now Select only Flower Products form Ordering===========
     var products =[];
     var keep;
     
      for (var i=0; i<flower.length; i++ ){ 
       //console.log(flower[i]["GIFTCOST"]);
      keep = "code as needed"
     products.push(keep);
     }
     //console.log(products);
     products=JSON.stringify(products);
     
      var ordertotal =totalorder["ORDERTOTAL"];//For Flowershop Only
      
      
      
      
      // Now Extract the Data for the GiftBasket
      
      var giftproducts =[];
     var giftkeep;
     var gifttotal=0;
       
        
      for (var g=0; g<giftbasket.length; g++ ){ 
       
      giftkeep =  "code as needed";
      
     giftproducts.push(giftkeep);
     
      gifttotal += parseFloat(giftbasket[g]["GIFTCOST"]);
     }
     
     giftproducts=JSON.stringify(giftproducts);
     
      
      
      
      //==============================================
     
      
      
      

      var total= "code as needed"
      var total2 =" code as needed"
      // API authentication credentials============
      var username = " username",
    password = "password",
    auth = "Basic " + new Buffer(username2 + ":" + password2).toString("base64"); //=======================================
    
       // API authentication credentials(GIFTBASKET)============
     var username2 = " username",
    password2 = "password",
    auth2 = "Basic " + new Buffer(username2 + ":" + password2).toString("base64");
    //=======================================
   
  
  
  
  
   //First Check if any flower even exist in the cart
   
  if ( !(typeof flower == "undefined" || flower == null || flower== ""||flower==[])){
  

                request.post(
                    {
                        url : total,
                        headers : {
                            'content-type' : 'application/x-www-form-urlencoded',
                            "Authorization" : auth//||auth,
                            
                          
                        },
                        
                    },
                    function (errors, response, body) {
                      if (errors){
                            console.log(errors);
                           
                       
                    }
                    else {
                        if ( response.statusCode == 200) {
                        var parsedata = JSON.parse(body);
                        
                        if (parsedata["errors"]){
                                                     //res.send(parsedata["errors"])
                                                     res.render("ordererror",{error:parsedata["errors"]});
                                                 } else {
                       
                        var ordernumber =parsedata["ORDERNO"];
                        
                        //first Order number above=======
                            //Get infomation about Order and display to Customer
                                 
                                 var total="https://www.floristone.com/api/rest/flowershop/getorderinfo?orderno="+ordernumber;
                             
                              
                           
                        request.get(
                              {
                                url : total,
                                headers : {
                                    'content-type' : 'application/x-www-form-urlencoded',
                                    "Authorization" : auth,
                                    
                                  
                                },
                                
                            },
                            function (errors, response, body) {
                              if (errors){
                                    console.log(errors);
                            }
                            else 
                                if ( response.statusCode == 200) {
                                 var parsedata = JSON.parse(body);
                                 
                                 
                                 
                  if ( typeof giftbasket == "undefined" || giftbasket == null || giftbasket== ""||giftbasket==[]){  
                      
                      console.log("Its a flower only order");
                     mysales++;
                      res.render("floweronlyorder",{orderdetails:parsedata});
                      
                         //====Time to delete the Cart
  
  
                            total = "https://www.floristone.com/api/rest/shoppingcart?sessionid="+req.sessionID;
  
                          request.delete(
                            {
                                url : total,
                                headers : {
                                    'content-type' : 'application/x-www-form-urlencoded',
                                    "Authorization" : auth,
                                    
                                  
                                },
                                
                            },
                            function (errors, response, body) {
                              if (errors){
                                    console.log(errors);
                            }
                            else 
                                if ( response.statusCode == 200) {
                                 var parsedata = JSON.parse(body);
                                 
                                 
                                     //console.log(body);
                                    
                                     
                                }});
                                
                                //===End of Delete
                      
                  }else {
                    //Time to get the giftbasket Order
                    
                        request.post(
                                {
                                    url : total2,
                                    headers : {
                                        'content-type' : 'application/x-www-form-urlencoded',
                                        "Authorization" : auth2//||auth,
                                        
                                      
                                    },
                                    
                                },
                                function (errors, response, body) {
                                  if (errors){
                                        console.log(errors);
                                       
                                   
                                }
                                else {
                                    if ( response.statusCode == 200) {
                                    var parsedata2 = JSON.parse(body);
                                    
                                    if (parsedata2["errors"]){
                                                                 console.log("error came from the giftbasket");
                                                                 res.render("ordererror",{error:parsedata2["errors"]});
                                                             } else {
                                                
                    
                                  // Render the Order Page
                                    console.log(parsedata2);
                                  mysales++;
                                    console.log("Its a combined order");
                                    res.render("combinedorder",{orderdetails:parsedata,giftorder:parsedata2,giftbasket:giftbasket,billdetails:billdetails});
    
                          //====================== 
                    
                        //====Time to delete the Cart
  
  
                            total = "https://www.floristone.com/api/rest/shoppingcart?sessionid="+req.sessionID;
  
                          request.delete(
                            {
                                url : total,
                                headers : {
                                    'content-type' : 'application/x-www-form-urlencoded',
                                    "Authorization" : auth,
                                    
                                  
                                },
                                
                            },
                            function (errors, response, body) {
                              if (errors){
                                    console.log(errors);
                            }
                            else 
                                if ( response.statusCode == 200) {
                                 var parsedata = JSON.parse(body);
                                 
                                 
                                     //console.log(body);
                                    
                                     
                                }});
                                
                                //===End of Delete
                                 
                                 
                                 
                                                             }}}});
                             
                  }
                                     
                                   
    
  
  
                         //=============================
                                 
                                 }});
    
    
     
    
    //End of Order Information Function
         
         
                                 
        
        }}
   
    }});
 
    
  }  
   
   
  else {
       //Well, just check for Giftbaskets and place Order
       
       //Time to get the giftbasket Order
                    
                        request.post(
                                {
                                    url : total2,
                                    headers : {
                                        'content-type' : 'application/x-www-form-urlencoded',
                                        "Authorization" : auth2//||auth,
                                        
                                      
                                    },
                                    
                                },
                                function (errors, response, body) {
                                  if (errors){
                                        console.log(errors);
                                       
                                   
                                }
                                else {
                                    if ( response.statusCode == 200) {
                                    var parsedata2 = JSON.parse(body);
                                    
                                    if (parsedata2["errors"]){
                                                                 //res.send(parsedata["errors"])
                                                                 res.render("ordererror",{error:parsedata2["errors"]});
                                                             } else {
                                                
                    
                                   // Render the Order Page
                                    console.log(parsedata2);
                                    mysales++;
                        console.log("Its a gift only order");
                                    res.render("giftonlyorder",{giftdetails:parsedata2,giftbasket:giftbasket,billdetails:billdetails});
    
                           //====================== 
                    
                    //============================================
                                  //====Time to delete the Cart
  
  
                            total = "https://www.floristone.com/api/rest/shoppingcart?sessionid="+req.sessionID;
  
                          request.delete(
                            {
                                url : total,
                                headers : {
                                    'content-type' : 'application/x-www-form-urlencoded',
                                    "Authorization" : auth,
                                    
                                  
                                },
                                
                            },
                            function (errors, response, body) {
                              if (errors){
                                    console.log(errors);
                            }
                            else 
                                if ( response.statusCode == 200) {
                                 var parsedata = JSON.parse(body);
                                 
                                 
                                     //console.log(body);
                                    
                                     
                                }});
                                
                                //===End of Delete
                                 
                                 
                                                             }}}});
       
      
       
       
       
  }
   
   
   
    //Email Confirmation when Order is made.Only order increment sent.
    mail2.welcome({
                  name: mysales,
                  subject: "New Order made at myflowerwebsite",
                  to: "youremail"
                }, function (err) {
                  if (err){res.send(err);console.log(err);
                }else {}});
                              
  // End of Email to myself
  
  
 
});

 













app.post("/orderview", function(req,res){
    var billdetails = req.body.bill;
    
     //console.log(billdetails);
    
    
    var summary =req.body.summary;
    var totalorder= req.body.totalorder;
    
    
  
    
    //Get IP of user and store in summary
    
    
     var total="http://freegeoip.net/json/?callback="; //This site supplies free visitor location details
    
    //API authentication credentials============
     var username= " username",
    password = "password",
    auth = "Basic " + new Buffer(username2 + ":" + password2).toString("base64");
    //=======================================
   


request.get(
    {
        url : total,
        headers : {
            'content-type' : 'application/x-www-form-urlencoded',
            "Authorization" : auth,
            
          
        },
        
    },
    function (errors, response, body) {
      if (errors){
            console.log(errors);
       
    }
    else {
        if ( response.statusCode == 200) {
        var parsedata = JSON.parse(body);
        var count=0;
        for (var i=0; i<summary.length; i++){
         summary[i]["IP"]=(parsedata["ip"]);
         //console.log(summary);
         count++
         if (count==summary.length){
            
             
        res.render("revieworder",{summary:summary,billdetails:billdetails,totalorder:totalorder});
         }else {}
        }
        }
   
    }});
    
    //End of IP search
    
    
     
});



app.post("/billing", function(req,res){
    var summary= req.body.summary;
    var datestore=[];
    var special= req.body.special;
    
   // console.log(summary);
    
    
 // ====Update some string things                 
                                
                                for (var j=0; j<summary.length; j++){
                 
                 summary[j]["CARDMESSAGE"] =special[j]["message"].split(' ').join('_');
                summary[j]["DELIVERYINSTRUCTIONS"] =special[j]["deliveryinstr"].split(' ').join('_');
                                }
            // ====Update some string things 
            
            
            
            
 
       //First Extract the flowerShop item into the variable flower
            var flower =[];
            var gift =[];
            for (var k=0; k<summary.length; k++){
                if (summary[k]["DIMENSION"]=='') {
                    gift.push(summary[k]);
                    
                }else {flower.push(summary[k]); }
                
                
            }
    
     
   // get the delivery dates list  
     
   //console.log(summary);
   //for (var i=0; i<summary.length; i++){
   
                              
             
                                            
                                       //API authentication credentials============
                             var username2 = " username",
                                password2 = "password",
                                auth2 = "Basic " + new Buffer(username2 + ":" + password2).toString("base64");
                                //=======================================      
                                   
                                  if ( !(typeof gift == "undefined" || gift == null || gift== ""||gift ==[])){        
                                   var binary=[{code:"xyz",zipcode:summary[0]["ZIPCODE"]},{code:gift[0]["CODE"],zipcode:summary[0]["ZIPCODE"]}];
                                      
                                  }
                                   
                                   else {
                                       binary=[{code:"xyz",zipcode:summary[0]["ZIPCODE"]}];
                                       
                                   }
                                   
                              //First Try to Get date from GiftBasket
                                  
                                  for(var i=0; i<binary.length;i++) {
                                   var totalgift="https://www.floristone.com/api/rest/giftbaskets/getproducts?code="+binary[i]["code"];
                                       
                                      //console.log(totalget);
                                       // API authentication credentials(GIFTBASKET)============
                                          var username2 = " username",
                                        password2 = "password",
                                        auth2 = "Basic " + new Buffer(username2 + ":" + password2).toString("base64");
                                        //=======================================
                                                                       
                                   
                                      var Store4flower=binary[i]["zipcode"]; 
                                      //console.log(i);
                                       
                                        
                                        request.get(
                                    {
                                        url : totalgift,
                                        headers : {
                                            'content-type' : 'application/x-www-form-urlencoded',
                                            "Authorization" : auth2,
                                        },
                                        
                                    },
                                    function (errors, response, body) {
                                          
                                      if (errors){
                                          console.log(errors);
                                       
                                    }
                                    else 
                                        if ( response.statusCode == 200) {
                                            
                                             var parsegift=JSON.parse(body);
                                             
                                             if (parsegift["errors"]) {
                                                 
                                                
                                                   //Get date from FlowerStore
                           
                           var totalget="https://www.floristone.com/api/rest/flowershop/checkdeliverydate?zipcode="+Store4flower;
                               
                             
                             
                                
                   var check =    request.get(
                            {
                                url : totalget,
                                headers : {
                                    'content-type' : 'application/x-www-form-urlencoded',
                                    "Authorization" : auth,
                                },
                                
                            },
                            function (errors, response, body) {
                                  
                              if (errors){
                                  console.log(errors);
                               
                            }
                            else 
                                if ( response.statusCode == 200) {
                                }
                               
                            });
                            
                             
                                               
                                        
                                           
                                    } else {
                                        
                                         //Since, no error on this case, we push to datestore,
                                            var date2push= parsegift["PRODUCTS"][0]["AVAILABLEDELIVERYDATES"] ;
                                                    }
                                            
                                             
                                            //The SetTimeOut allow the access of the Check variable 
                                            
                                             setTimeout(function(){
                                                 
                                                 
                                         
                                                  
                                                     
                                                    
                                                    
                                                    // ===To control the Push ====== 
                                                   
                                                    
                                                  if ( !(typeof flower == "undefined" || flower == null || flower== ""||flower==[]
                                                  ||typeof check == "undefined" || check == null || check== ""||check==[])){ 
                                                      
                                                    for (var f=0; f<flower.length ; f++){
                                                        
                                                      var move = JSON.parse(check["responseContent"]["body"])["DATES"];
                                                      datestore.push(move);
                                                      }
                                                  }  
                                                   
                                                   
                                                     if ( !(typeof gift == "undefined" || gift == null || gift== ""||gift==[]||
                                                      typeof date2push == "undefined" || date2push == null || date2push== ""||date2push==[])){
                                                      for (var f=0; f<gift.length ; f++){
                                                      
                                                     datestore.push(date2push) ;
                                                       }
                                                     
                                                   }  
                                               
                                                   
                                                   
                                                   if(!(typeof flower == "undefined" || flower == null || flower== ""||flower==[])){ //some flower exists
                                                       if (datestore.length ==flower.length){                          //Check that all flowers are pushed in datestore
                                                           if ( !(typeof gift == "undefined" || gift == null || gift== ""||gift==[]||
                                                      typeof date2push == "undefined" || date2push == null || date2push== ""||date2push==[])){ //only log for the defined toute
                                                      for (var f=0; f<gift.length ; f++){
                                                      
                                                     datestore.push(date2push) ;
                                                       }}}}
                                                     
                                                  
                                                   
                                                   
                                             
                                                       
                                                      console.log(datestore);
                                                     
                                                  
                                                    
                                 if (datestore.length==summary.length){
                                   
                                   if(datestore[0]==undefined) {
                                       
                                      res.render("zipproblem"); 
                                       
                                       
                                   }else{
                                   
                                 var keep=[];  
                                 var count=0;
                                 
             // Execute Total Order search and pass to Billing
            
            
            if ( typeof flower == "undefined" || flower == null || flower== ""||flower==[]){
                
                res.render("billing",{summary:summary,datestore:datestore,totalorder:[]});
            } else{
             
             for (var j=0; j<flower.length; j++){
                 
                 
                
                 
             var price=(flower[j]["PRICE"]);
             var zip=(flower[j]["ZIPCODE"]);
             var cod=(flower[j]["CODE"]);
             var comb ={"PRICE":price,"RECIPIENT":{"ZIPCODE":zip},"CODE":cod};
             keep.push(comb);
             
            
             
             //var details = JSON.stringify([{"PRICE":price,"RECIPIENT":{"ZIPCODE":zip},"CODE":cod}]);
             var details =JSON.stringify(keep);
             
             //console.log(details);
             var total="https://www.floristone.com/api/rest/flowershop/gettotal?products="+details;
             
            // =========Set some timeout to wait for API response ===================
      setTimeout(function() {
    
      //=====start of request =============== 
                        request.get(
                            {
                                url : total,
                                headers : {
                                    'content-type' : 'application/x-www-form-urlencoded',
                                    "Authorization" : auth,
                                  
                                },
                                
                            },
                            function (errors, response, body) {
                              if (errors){
                                    console.log(errors);
                               
                            }
                            else {
                                if ( response.statusCode == 200) {
                                var parsetotal = JSON.parse(body);
                                count++;
                                  if(parsetotal["errors"]) {
                                      res.render("zipproblem");
                                  } else {
                               
                                   if (count==flower.length){
                                     
                                   // console.log(parsetotal);
                                         
                                res.render("billing",{summary:summary,datestore:datestore,totalorder:parsetotal});   
                                
                                   }else {}
                                	
                                }
                           
                           } }});
             
              
                  }, 2000); 
             }}
             //=======================End of Total Order Search        
                                   
                                   
                                   
                              
                                } } else {
                                    //console.log("END OF CYCLE");
                                }
                                                    
                                                    
                                                    //===================================
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    
                                                    
                                                       
                                                    },2000);
    
                               
             
                                             
                                           
                                        }
                                        
                                    });
                                             
                                  }          
                                             
             //End of Check for datestore
             
        
    
   
  
   
   
    //console.log(datestore);
   
    
    
});




app.post("/delivery", function(req,res){
    var product= req.body.product;
    //console.log(product);
   
   res.render("delivery",{product:product}); 
    
  });





app.get("/cart", function(req,res){
    
    
        	   
        var totalget="https://www.floristone.com/api/rest/shoppingcart?sessionid="+req.sessionID;
       
      
       //API authentication credentials============
     var username2 = " username",
    password2 = "password",
    auth2 = "Basic " + new Buffer(username2 + ":" + password2).toString("base64"); //=======================================
   
      
      // =========Set some timeout to wait for API response ===================
      // setTimeout(function() {
    
       //=====start of request ===============
        
        request.get(
    {
        url : totalget,
        headers : {
            'content-type' : 'application/x-www-form-urlencoded',
            "Authorization" : auth,
            
          
        },
        
    },
    function (errors, response, body) {
      if (errors){
          console.log(errors);
       
    }
    else {
        if ( response.statusCode == 200) {
        
        var parseproduct = JSON.parse(body);
        var cartlist = parseproduct["products"];
         
       
          if(  typeof cartlist == "undefined" || cartlist == null || cartlist== ""||cartlist==[]){
        	res.render("emptycart");
        //	console.log("NOTHING IN SESSION");
        }else{ 
        	
        	var productstore=[];
        	
          
               	         
                  	         	cartlist.forEach(function(i){
        		
        	
      //============TO POPULATE THE CART OBJECT 
        
             var totalflower = "https://www.floristone.com/api/rest/flowershop/getproducts?code=" + i["CODE"];
         
    //============REQUEST FOR FLOWER PRODUCT ============
request(
    {
        url : totalflower,
        headers : {
            'content-type' : 'application/x-www-form-urlencoded',
            "Authorization" : auth,
         },
        
    },
    function (errors, response, body) {
      if (errors){
          console.log(errors);
       
    }
    else {
        if ( response.statusCode == 200) {
        
        var parseproduct = JSON.parse(body);
         
       
      
         if  ( parseproduct["errors"])      {
        	
        
        	//console.log(parseproduct);
        
         	//==============We now request for Giftbaskets=====
         	
         	 var totalnew = "https://www.floristone.com/api/rest/giftbaskets/getproducts?code=" + i["CODE"];
   
    //============REQUEST FOR MAIN PRODUCT ============
request(
    {
        url : totalnew,
        headers : {
            'content-type' : 'application/x-www-form-urlencoded',
            "Authorization" : auth,
         },
        
    },
    function (errors, response, body) {
      if (errors){
          console.log(errors);
       
    }
    else {
    	
    	//we presnet flowers============(not giftbaskets)
        if ( response.statusCode == 200) {
        	
        	var parseproduct2 = JSON.parse(body);
        //	console.log (parseproduct2);
        
        	var product = parseproduct2 ["PRODUCTS"][0];
              
              productstore.push(product);
              
          if(productstore.length==cartlist.length)
             {
          res.render("cart",{productstore:productstore});
             }else {}
        	
        }}});
         	
        	
         	
         	
         	
         //===================================================	
         }else{
        
          
          var product = parseproduct ["PRODUCTS"][0];
              
              productstore.push(product);
             
              
           if(productstore.length==cartlist.length)
             {
           res.render("cart",{productstore:productstore});
             }else {}
      
        }}}}    );
        
        	});
        	
        
    	
    }
        	
        }}});
        //============End of Get request
        
        	
     // }, 1000);
});






//=========================


app.post("/session/:type/:id/:action", function(req,res){
	var product=req.params.id;
   
    
	var action =req.params.action;

	

    var total="https://www.floristone.com/api/rest/shoppingcart?sessionid="+req.sessionID;
    //API authentication credentials============
     var username2 = " username",
    password2 = "password",
    auth2 = "Basic " + new Buffer(username2 + ":" + password2).toString("base64");
    //=======================================
   


request.post(
    {
        url : total,
        headers : {
            'content-type' : 'application/x-www-form-urlencoded',
            "Authorization" : auth,
            
          
        },
        
    },
    function (errors, response, body) {
      if (errors){
            console.log(errors);
       
    }
    else {
        if ( response.statusCode == 200) {
        //var parsedata = JSON.parse(body);
         
     //res.send(body);
   
     
                  }
          }
    }
);

if (action=="add"){

setTimeout(function() {

	  var totaladd="https://www.floristone.com/api/rest/shoppingcart?sessionid="+req.sessionID+"&action=add&productcode="+product;
					        
					        request.put(
					    {
					        url : totaladd,
					        headers : {
					            'content-type' : 'application/x-www-form-urlencoded',
					            "Authorization" : auth,
					            
					          
					        },
					        
					    },
					    function (errors, response, body) {
					      if (errors){
					          console.log(errors);
					       
					    }
					    else {
					        if ( response.statusCode == 200) {
					        // console.log(body);
					       
					         
					          
					        	//res.send(body);
					        res.redirect("/cart" );
					       }
					    	
					    }});
					    
					}, 2000); //End of TimeOut=============== 
					
					
}else 
if (action == "remove") {
        	  	// =============Code to remove from a session
                 var totalremove="https://www.floristone.com/api/rest/shoppingcart?sessionid="+req.sessionID+"&action=remove&productcode="+product;
					        
					        request.put(
					    {
					        url : totalremove,
					        headers : {
					            'content-type' : 'application/x-www-form-urlencoded',
					            "Authorization" : auth,
					            
					          
					        },
					        
					    },
					    function (errors, response, body) {
					      if (errors){
					          console.log(errors);
					       
					    }
					    else {
					        if ( response.statusCode == 200) {
					        
					        	//console.log(body);
					        	res.redirect("/cart");
					       }
					    	
					    }});
  
} 	

	else {}
			
					  
					});


 
// ================================

















//===============================

app.get("/details/:cat/:type/:item", function(req,res){
	  var category =req.params.cat;
	  var type=req.params.type;
	  var item=req.params.item;
	  
	  
	   
    var total = "https://www.floristone.com/api/rest/"+type+"/getproducts?code=" + item;
    var reltotal = "https://www.floristone.com/api/rest/"+type+"/getproducts?category=" + category;
    //API authentication credentials============
     var username2 = " username",
    password2 = "password",
    auth2 = "Basic " + new Buffer(username2 + ":" + password2).toString("base64");
    //=======================================
    
  
	  
    
    
    
    
//============REQUEST FOR MAIN PRODUCT ============
request(
    {
        url : total,
        headers : {
            'content-type' : 'application/x-www-form-urlencoded',
            "Authorization" : auth,
            
          
        },
        
    },
    function (errors, response, body) {
      if (errors){
          console.log(errors);
       
    }
    else {
        if ( response.statusCode == 200) {
        
        var parseproduct = JSON.parse(body);
         
        if (!parseproduct ["PRODUCTS"]){
        	res.redirect("/*");
        	console.log("Wrong category chosen");
        }else{
        
          
          var product = parseproduct ["PRODUCTS"][0];
          
          
          
          
            //============request to find related products
request(
    {
        url : reltotal,
        headers : {
            'content-type' : 'application/x-www-form-urlencoded',
            "Authorization" : auth,
            
          
        },
        
    },
    function (errors, response, body2) {
      if (errors){
          console.log(errors);
       
    }
    else {
        if ( response.statusCode == 200) {
        
        var parsedata = JSON.parse(body2);
        
       
        if (!parsedata ["PRODUCTS"]){
        	res.redirect("/*");
        	console.log("Wrong category chosen");
        }else{

         var count =getRandomArbitrary(0, 12);
         var relproduct1 = parsedata ["PRODUCTS"][(count)];
         var relproduct2 = parsedata ["PRODUCTS"][(count+2)];
         var relproduct3 = parsedata ["PRODUCTS"][(count+4)];
         
        
         
         res.render("details",{category:category,type:type,product:product,relproduct1:relproduct1,relproduct2:relproduct2,relproduct3:relproduct3}); 
    }
    }}}
);

//==================================
  
                 }
           }
    }
    }
);


	 
	
});

 // Returns a random number between min (inclusive) and max (exclusive)//==used to generate random relatedproducts==
function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min) + min) ;
}



app.post("/:type/:cat/:id/", function(req,res){
var sort = req.body.sortby;
var type=req.params.type;
var category=req.params.cat;
var startnumber=req.params.id; 
var url ="/"+type+"/"+category+"/"+startnumber;

    
    //determine selection
  
                               switch(category) {
								    case "wg": 
								     var selection= "All Gift Items"; 
								        break;
								        case "ccm": 
								      selection= "Cookies, Chocolates, and More"; 
								        break;
								        case "fb": 
								      selection= "Fruit baskets"; 
								        break;
								        case "gb": 
								      selection= "Gourmet Baskets"; 
								        break;
								        case "mfc": 
								     selection= "Mrs. Fields Cookies"; 
								        break;
								        case "nb": 
								      selection= "New Baby World"; 
								        break;
								        case "spa": 
								      selection= "Spa Items"; 
								        break;
								        case "cat": 
								      selection= "Coffee and Tea"; 
								        break;
								        case "ecc": 
								      selection= "Eli’s Cheesecake"; 
								        break;
								          case "ao": 
								      selection= "Every Day Flowers"; 
								        break;
								        case "bd": 
								      selection= "Birthday"; 
								        break;
								        case "an": 
								      selection= "Anniversary"; 
								        break;
								        case "lr": 
								      selection= "Love & Romance"; 
								        break;
								        case "gw": 
								      selection= "Get Well"; 
								        break;
								       
								        case "ty": 
								      selection= "Thank You"; 
								        break;
								        case "sy": 
								      selection= "Funerals and Sympathy"; 
								        break;
								        case "c": 
								      selection= "Centerpieces"; 
								        break;
								        case "o": 
								      selection= "One Sided Specials"; 
								        break;
								          case "n": 
								      selection= "Novelty Specials"; 
								        break;
								          case "v": 
								      selection= "Vased Specials"; 
								        break;
								          case "ao": 
								      selection= "Every Day Flower"; 
								        break;
								          case "r": 
								      selection= "Roses"; 
								        break;
								          case "q": 
								      selection= "Cut Bouquets"; 
								        break;
								          case "x": 
								      selection= "Fruit Baskets"; 
								        break;
								          case "p": 
								      selection= "Plants"; 
								        break;
								          case "b": 
								      selection= "Balloons"; 
								        break;
								          case "fa": 
								      selection= "Funeral Table arrangements"; 
								        break;
								          case "fs": 
								      selection= "Funeral Sprays"; 
								        break;
								          case "fp": 
								      selection= "Funeral Plants"; 
								        break;
								          case "fl": 
								      selection= "Funeral Inside Casket"; 
								        break;
								          case "fw": 
								      selection= "Funeral Wreaths"; 
								        break;
								          case "fh": 
								      selection= "Funeral Hearts"; 
								        break;
								          case "fx": 
								      selection= "Funeral Crosses"; 
								        break;
								          case "fc": 
								      selection= "Funeral Casket sprays"; 
								        break;
								          case "u60": 
								      selection= "Flowers under $60"; 
								        break;
								          case "60t80": 
								      selection= "Flowers between $60 and $60"; 
								        break;
								         case "80t100": 
								      selection= "Flowers between $80 and $100"; 
								        break;
								         case "a100": 
								      selection= "Flowers above $100"; 
								        break;
								         case "fu60": 
								      selection= "Funeral Flowers Under $60"; 
								        break;
								         case "f60t80": 
								      selection= "Funeral Flowers between $60 and $80"; 
								        break;
								         case "f80t100": 
								      selection= "Funeral Flowers between $80 and $100"; 
								        break;
								         case "fa100": 
								      selection= "Funeral Flowers above $100"; 
								        break;
								         case "all": 
								      selection= "All Flowers"; 
								        break;
								         case "cm": 
								      selection= "Christmas"; 
								        break;
								         case "ea": 
								      selection= "Easter"; 
								        break;
								        case "vd": 
								      selection= "Valentines Day"; 
								        break;
								        case "md": 
								      selection= "Mothers Day"; 
								        break;
                               }
                               
                  
				            
    
    
    
    
    
    
    //=========================
    
    
    
    
    
    
    if (sort=="no"){
    	var total = "https://www.floristone.com/api/rest/"+type+"/getproducts?category=" + category+"&start="+ startnumber;
    }else {
    
    var total = "https://www.floristone.com/api/rest/"+type+"/getproducts?category=" + category+"&start="+ startnumber+"&sorttype="+sort;
    }
    //API authentication credentials============
      var username2 = " username",
    password2 = "password",
    auth2 = "Basic " + new Buffer(username2 + ":" + password2).toString("base64");
    //=======================================

request(
    {
        url : total,
        headers : {
            'content-type' : 'application/x-www-form-urlencoded',
            "Authorization" : auth,
            
          
        },
        
    },
    function (errors, response, body) {
      if (errors){
          console.log(errors);
       
    }
    else {
        if ( response.statusCode == 200) {
        
        var parsedata = JSON.parse(body);
        
         
        if (!parsedata ["PRODUCTS"]){
        	res.redirect("/*");
        	console.log("Wrong category chosen");
        }else{
          var quantity= parsedata ["TOTAL"];
          var numberofpages= Math.ceil(quantity / 12);
          var product = parsedata ["PRODUCTS"];

     res.render("category",{category:category,product:product,selection:selection,numberofpages:numberofpages,type:type,startnumber:startnumber,sort:sort,url:url});
        }
     
                   }
           }
    }
);

    
    
	
});


app.get("/:type/:cat/:id", function(req,res){
    var type=req.params.type;
    var category=req.params.cat;
    var startnumber=req.params.id;
    var url ="/"+type+"/"+category+"/"+startnumber;
   //predefine "sort"
     var sort="no";
    //determine selection
  
                               switch(category) {
								    case "wg": 
								     var selection= "All Gift Items"; 
								        break;
								        case "ccm": 
								      selection= "Cookies, Chocolates, and More"; 
								        break;
								        case "fb": 
								      selection= "Fruit baskets"; 
								        break;
								        case "gb": 
								      selection= "Gourmet Baskets"; 
								        break;
								        case "mfc": 
								     selection= "Mrs. Fields Cookies"; 
								        break;
								        case "nb": 
								      selection= "New Baby World"; 
								        break;
								        case "spa": 
								      selection= "Spa Items"; 
								        break;
								        case "cat": 
								      selection= "Coffee and Tea"; 
								        break;
								        case "ecc": 
								      selection= "Eli’s Cheesecake"; 
								        break;
								          case "ao": 
								      selection= "Every Day Flowers"; 
								        break;
								        case "bd": 
								      selection= "Birthday"; 
								        break;
								        case "an": 
								      selection= "Anniversary"; 
								        break;
								        case "lr": 
								      selection= "Love & Romance"; 
								        break;
								        case "gw": 
								      selection= "Get Well"; 
								        break;
								       
								        case "ty": 
								      selection= "Thank You"; 
								        break;
								        case "sy": 
								      selection= "Funerals and Sympathy"; 
								        break;
								        case "c": 
								      selection= "Centerpieces"; 
								        break;
								        case "o": 
								      selection= "One Sided Specials"; 
								        break;
								          case "n": 
								      selection= "Novelty Specials"; 
								        break;
								          case "v": 
								      selection= "Vased Specials"; 
								        break;
								          case "ao": 
								      selection= "Every Day Flower"; 
								        break;
								          case "r": 
								      selection= "Roses"; 
								        break;
								          case "q": 
								      selection= "Cut Bouquets"; 
								        break;
								          case "x": 
								      selection= "Fruit Baskets"; 
								        break;
								          case "p": 
								      selection= "Plants"; 
								        break;
								          case "b": 
								      selection= "Balloons"; 
								        break;
								          case "fa": 
								      selection= "Funeral Table arrangements"; 
								        break;
								          case "fs": 
								      selection= "Funeral Sprays"; 
								        break;
								          case "fp": 
								      selection= "Funeral Plants"; 
								        break;
								          case "fl": 
								      selection= "Funeral Inside Casket"; 
								        break;
								          case "fw": 
								      selection= "Funeral Wreaths"; 
								        break;
								          case "fh": 
								      selection= "Funeral Hearts"; 
								        break;
								          case "fx": 
								      selection= "Funeral Crosses"; 
								        break;
								          case "fc": 
								      selection= "Funeral Casket sprays"; 
								        break;
								          case "u60": 
								      selection= "Flowers under $60"; 
								        break;
								          case "60t80": 
								      selection= "Flowers between $60 and $60"; 
								        break;
								         case "80t100": 
								      selection= "Flowers between $80 and $100"; 
								        break;
								         case "a100": 
								      selection= "Flowers above $100"; 
								        break;
								         case "fu60": 
								      selection= "Funeral Flowers Under $60"; 
								        break;
								         case "f60t80": 
								      selection= "Funeral Flowers between $60 and $80"; 
								        break;
								         case "f80t100": 
								      selection= "Funeral Flowers between $80 and $100"; 
								        break;
								         case "fa100": 
								      selection= "Funeral Flowers above $100"; 
								        break;
								         case "all": 
								      selection= "All Flowers"; 
								        break;
								         case "cm": 
								      selection= "Christmas"; 
								        break;
								         case "ea": 
								      selection= "Easter"; 
								        break;
								        case "vd": 
								      selection= "Valentines Day"; 
								        break;
								        case "md": 
								      selection= "Mothers Day"; 
								        break;
                               }
				            
    
        
    
    
    //=========================
    
    
    
    
    
    var total = "https://www.floristone.com/api/rest/"+type+"/getproducts?category=" + category+"&start="+ startnumber;

    //API authentication credentials============
      var username2 = " username",
    password2 = "password",
    auth2 = "Basic " + new Buffer(username2 + ":" + password2).toString("base64");
    //=======================================

request(
    {
        url : total,
        headers : {
            'content-type' : 'application/x-www-form-urlencoded',
            "Authorization" : auth,
            
          
        },
        
    },
    function (errors, response, body) {
      if (errors){
          console.log(errors);
       
    }
    else {
        if ( response.statusCode == 200) {
        
        var parsedata = JSON.parse(body);
        
         
        if (!parsedata ["PRODUCTS"]){
        	res.redirect("/*");
        	console.log("Wrong category chosen");
        }else{
          var quantity= parsedata ["TOTAL"];
          var numberofpages= Math.ceil(quantity / 12);
          var product = parsedata ["PRODUCTS"];

     res.render("category",{category:category,product:product,selection:selection,numberofpages:numberofpages,type:type,startnumber:startnumber,sort:sort,url:url});
        }
     
                   }
           }
    }
);

    
    
    
});

app.get("/page/:type/:cat/:id/:sortmethod", function(req,res){
	var sort = req.params.sortmethod;
var type=req.params.type;
var category=req.params.cat;
var startnumber=req.params.id; 
var url ="/page/"+type+"/"+category+"/"+startnumber+"/"+sort;

    
    //determine selection
  
                              switch(category) {
								    case "wg": 
								     var selection= "All Gift Items"; 
								        break;
								        case "ccm": 
								      selection= "Cookies, Chocolates, and More"; 
								        break;
								        case "fb": 
								      selection= "Fruit baskets"; 
								        break;
								        case "gb": 
								      selection= "Gourmet Baskets"; 
								        break;
								        case "mfc": 
								     selection= "Mrs. Fields Cookies"; 
								        break;
								        case "nb": 
								      selection= "New Baby World"; 
								        break;
								        case "spa": 
								      selection= "Spa Items"; 
								        break;
								        case "cat": 
								      selection= "Coffee and Tea"; 
								        break;
								        case "ecc": 
								      selection= "Eli’s Cheesecake"; 
								        break;
								          case "ao": 
								      selection= "Every Day Flowers"; 
								        break;
								        case "bd": 
								      selection= "Birthday"; 
								        break;
								        case "an": 
								      selection= "Anniversary"; 
								        break;
								        case "lr": 
								      selection= "Love & Romance"; 
								        break;
								        case "gw": 
								      selection= "Get Well"; 
								        break;
								       
								        case "ty": 
								      selection= "Thank You"; 
								        break;
								        case "sy": 
								      selection= "Funerals and Sympathy"; 
								        break;
								        case "c": 
								      selection= "Centerpieces"; 
								        break;
								        case "o": 
								      selection= "One Sided Specials"; 
								        break;
								          case "n": 
								      selection= "Novelty Specials"; 
								        break;
								          case "v": 
								      selection= "Vased Specials"; 
								        break;
								          case "ao": 
								      selection= "Every Day Flower"; 
								        break;
								          case "r": 
								      selection= "Roses"; 
								        break;
								          case "q": 
								      selection= "Cut Bouquets"; 
								        break;
								          case "x": 
								      selection= "Fruit Baskets"; 
								        break;
								          case "p": 
								      selection= "Plants"; 
								        break;
								          case "b": 
								      selection= "Balloons"; 
								        break;
								          case "fa": 
								      selection= "Funeral Table arrangements"; 
								        break;
								          case "fs": 
								      selection= "Funeral Sprays"; 
								        break;
								          case "fp": 
								      selection= "Funeral Plants"; 
								        break;
								          case "fl": 
								      selection= "Funeral Inside Casket"; 
								        break;
								          case "fw": 
								      selection= "Funeral Wreaths"; 
								        break;
								          case "fh": 
								      selection= "Funeral Hearts"; 
								        break;
								          case "fx": 
								      selection= "Funeral Crosses"; 
								        break;
								          case "fc": 
								      selection= "Funeral Casket sprays"; 
								        break;
								          case "u60": 
								      selection= "Flowers under $60"; 
								        break;
								          case "60t80": 
								      selection= "Flowers between $60 and $60"; 
								        break;
								         case "80t100": 
								      selection= "Flowers between $80 and $100"; 
								        break;
								         case "a100": 
								      selection= "Flowers above $100"; 
								        break;
								         case "fu60": 
								      selection= "Funeral Flowers Under $60"; 
								        break;
								         case "f60t80": 
								      selection= "Funeral Flowers between $60 and $80"; 
								        break;
								         case "f80t100": 
								      selection= "Funeral Flowers between $80 and $100"; 
								        break;
								         case "fa100": 
								      selection= "Funeral Flowers above $100"; 
								        break;
								         case "all": 
								      selection= "All Flowers"; 
								        break;
								         case "cm": 
								      selection= "Christmas"; 
								        break;
								         case "ea": 
								      selection= "Easter"; 
								        break;
								        case "vd": 
								      selection= "Valentines Day"; 
								        break;
								        case "md": 
								      selection= "Mothers Day"; 
								        break;
                              }
                               
                  
				            
    
    
    
    
    
    
    //=========================
    
    
    
    
    
    
    if (sort=="no"){
    	var total = "https://www.floristone.com/api/rest/"+type+"/getproducts?category=" + category+"&start="+ startnumber;
    }else {
    
     total = "https://www.floristone.com/api/rest/"+type+"/getproducts?category=" + category+"&start="+ startnumber+"&sorttype="+sort;
    }
    //API authentication credentials============
      var username2 = " username",
    password2 = "password",
    auth2 = "Basic " + new Buffer(username2 + ":" + password2).toString("base64");
    //=======================================

request(
    {
        url : total,
        headers : {
            'content-type' : 'application/x-www-form-urlencoded',
            "Authorization" : auth,
            
          
        },
        
    },
    function (errors, response, body) {
      if (errors){
          console.log(errors);
       
    }
    else {
        if ( response.statusCode == 200) {
        
        var parsedata = JSON.parse(body);
        
        if (!parsedata ["PRODUCTS"]){
        	res.redirect("/*");
        	console.log("Wrong category chosen");
        }else{
        	
        
          var quantity= parsedata ["TOTAL"];
          var numberofpages= Math.ceil(quantity / 12);
          var product = parsedata ["PRODUCTS"];

     res.render("category",{category:category,product:product,selection:selection,numberofpages:numberofpages,type:type,startnumber:startnumber,sort:sort,url:url});
        }
     
                  }
          }
    });
});


  
//============================






//======================================
app.get("/*", function(req,res){
    
    res.render("otherpages");
});



                                                        //A simple sleep function
                                                      function wait(ms){
                                                               var start = new Date().getTime();
                                                               var end = start;
                                                               while(end < start + ms) {
                                                                 end = new Date().getTime();
                                                              }
                                                            }
                                                                 //A simple sleep function





//server listening ======================================
app.listen (process.env.PORT, process.env.IP, function(){
   console.log("The APP1  Server has Started!");
         });
         
//======================================================
