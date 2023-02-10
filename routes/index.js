var express = require('express');
var router = express.Router();

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

  const { firstname, lastname, email, password, dob, gender } = req.body;

  const createUser = {
    firstname,
    lastname,
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
router.get('/Home', function (req, res, next) {
  res.render('Home', { title: "Socailmedia" });
});

router.get('/profile', function (req, res, next) {
  res.render('profile', { title: "Socailmedia | Profile" });
});



module.exports = router;
