var express = require("express");
var router = express.Router();
var Place = require("../models/place");

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter});

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dpurin337', 
  api_key:  '294134614461722', 
  api_secret: '0vifpxFvDJKcnEAKRBeJSOeuH9U'
});

//Get all places from db
router.get("/", function(req, res){
    Place.find({}, function(err, allPlaces){
        console.log(req.user);
        if(err){
            console.log(err);
        } else {
            res.render("places/index", {places: allPlaces});
        }
    });
});

//get data from form and add to places array
//redirect back to places page
//Create a new place and add to DB
router.post("/", isLoggedIn,  upload.single('image'), function(req,res) {
   
    cloudinary.v2.uploader.upload(req.file.path, function (error, result) {
        console.log(result, error);
        // add cloudinary url for the image to the place object under image property
        req.body.place.image = result.secure_url;
        // add author to place
        req.body.place.author = {
            id: req.user._id,
            username: req.user.username
        };
        Place.create(req.body.place, function (err, place) {
            if (err) {
                // req.flash('error', err.message);
                // return res.redirect('back');
                console.log(err);
            }
            res.redirect('/places/' + place.id);
        });
    });
});

router.get("/new", isLoggedIn, function(req,res){
    res.render("places/new");
});


// find the campground with the provided ID
// render show template with that campground
router.get("/:id", function(req,res){
    Place.findById(req.params.id).populate("comments").exec(function(err, foundPlace){
        if(err) {
            console.log(err);
        } else {
            console.log(foundPlace);
            res.render("places/show", {place : foundPlace});
        }
    });
});

//EDIT PLACE ROUTE
router.get("/:id/edit",function(req,res){
    Place.findById(req.params.id, function(err,foundPlace){
      if (err) {
          res.redirect("/places");
      }  else{
        res.render("places/edit", {place: foundPlace});
      }
    });
});

//UPDATE PLACE ROUTE
router.put("/:id", function(req,res){
    //find and update the correct place
    Place.findByIdAndUpdate(req.params.id,req.body.place, function(err, updatedPlace){
        if(err){
            res.redirect("/places");
        } else {
            res.redirect("/places/" + req.params.id);
        }
    });
    //redirect on the show page
    
});

//middleware to check if user is logged in
function isLoggedIn(req,res,next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

module.exports = router;