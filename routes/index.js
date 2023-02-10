var express = require('express');
var router = express.Router();
var upload = require("../utils/multer");

const fs = require('fs');
const path = require('path');
const User = require("../models/userSchema");
const passport = require("passport");
const LocalStrategy = require("passport-local");



passport.use(User.createStrategy());

router.get('/', function (req, res, next) {
  res.render('signin', { title: "Socailmedia - signin or signup" });
});

router.get('/signup', function (req, res, next) {
  res.render('signup', { title: "Socailmedia - signin or signup" });
});

// signup
router.post('/signup', function (req, res, next) {

  const { firstname, lastname, username, email, password, dob, gender } = req.body;

  const createUser = {
    firstname,
    lastname,
    username,
    email,
    dob,
    gender
  };

  User.register(createUser, password)
    .then((usercreated) => {
      res.redirect('/');
    })
    .catch((err) => {
      console.log(err);
    })

});

// signin
router.post('/signin', passport.authenticate("local", {
  successRedirect: "/Home",
  failureRedirect: "/"
}), function (req, res, next) { });

// Home
router.get('/Home', isLoggedIn, function (req, res, next) {
  res.render('Home', { title: "Socailmedia" });
});

// profile
router.get('/profile', isLoggedIn, function (req, res, next) {
  res.render('profile', { title: "Socailmedia | Profile", user: req.user });
});

// editprofile

router.get('/editprofile', isLoggedIn, function (req, res, next) {
  res.render('editprofile', { title: "Socailmedia | Edit-profile", user: req.user });
});

// /profileimage

router.post('/profileimage', isLoggedIn, upload.single('avatar'), function (req, res, next) {

  const updatedAvatar = {};

  if (req.file) {
    if (req.body.oldavatar !== "dummy.png") {
      fs.unlinkSync(
        path.join(
          __dirname,
          "..",
          "public",
          "assets",
          req.body.oldavatar
        )
      );
    }
    updatedAvatar.avatar = req.file.filename;
  };

  User.findByIdAndUpdate(req.user._id, updatedAvatar)
    .then(() => {
      res.redirect("/profile");
    })
    .catch((err) => res.send(err));

});



// ----------------------------------------Middleware-----------------------------------------

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    next();
    return;
  }
  res.redirect("/");
}


module.exports = router;
