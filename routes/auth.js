var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

// This is the main get page for the application
router.get("/", function(req, res){
    res.render("landing");
});

// ===========
// AUTH ROUTES
// ============

// SHOW REGISTER FORM 
router.get("/register", function(req,res){
    res.render("register");
});

//handle sing up logic
router.post("/register", function(req,res){
    console.log("signing up");
   var newUser = new User({username: req.body.username});
   User.register(newUser, req.body.password, function(err, user){
       if(err) {
           console.log(err);
           return res.render("register")
       }
       passport.authenticate("local")(req, res, function(){
            res.redirect("/places");
       });
   });
});


// ===========
// LOGIN ROUTES
// ============


//show login form
router.get("/login", function(req,res){
    res.render("login");
});

//handling login logic
router.post("/login", passport.authenticate("local",
    {
    successRedirect: "/places",
    failureRedirect: "/login"
    }), function (req, res) {

});

//logout route
router.get("/logout", function(req,res){
    req.logout();
    res.redirect("/places");
});

//middleware to check if user is logged in
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;