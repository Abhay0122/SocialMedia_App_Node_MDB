var express = require('express');
var router = express.Router();
var upload = require("../utils/multer");

const nodemailer = require("nodemailer");

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

// profileimage

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

// userinfo

router.post('/userinfo', isLoggedIn, function (req, res, next) {

  User.findByIdAndUpdate(req.user._id, req.body)
    .then((updatedData) => {
      // res.json(updatedData);
      res.redirect('/profile')
    })
    .catch((err) => {
      res.send(err);
    })

});

// reset-password
router.get("/reset-password", isLoggedIn, function (req, res, next) {
  res.render('Resetpwd', { title: "Socailmedia | Reset-password", user: req.user })
});

router.post('/reset-password', isLoggedIn, function (req, res, next) {

  const { oldPassword, newPassword } = req.body;

  req.user.changePassword(oldPassword, newPassword, function (err, user) {
    if (err) return res.send(err);
    res.redirect('/signout');
  });

});

// logout
router.get("/signout", isLoggedIn, function (req, res, next) {
  req.logout(function () {
    res.redirect("/");
  });
});

// delete-account
router.get('/delete-account', isLoggedIn, function (req, res, next) {

  User.findByIdAndDelete(req.user._id)
    .then(() => {
      res.redirect('/signout');
    })
    .catch((err) => {
      res.send(err);
    });

});

// Forget-password
router.get("/forget-password", function (req, res, next) {
  res.render('Forgetpwd', { title: "Socailmedia | Forget-password", user: req.user })
});

router.post("/forget-password", function (req, res, next) {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user)
        return res.send(
          "User Not found <a href='/forget-password'>Try Harder!</a>"
        );

      // next page url
      const pageurl =
        req.protocol +
        "://" +
        req.get("host") +
        "/set-password/" +
        user._id;

      // send email to the email with gmail
      const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
          user: "developerabhay934@gmail.com",
          pass: "lvigqviuvqorxrpu",
        },
      });

      const mailOptions = {
        from: "Abhay Pvt. Ltd.<developerabhay934@gmail.com>",
        to: req.body.email,
        subject: "Password Reset Link",
        text: "Do not share this link to anyone.",
        html: `<a href=${pageurl}>Password Reset Link</a>`,
      };

      transport.sendMail(mailOptions, (err, info) => {
        if (err) return res.send(err);
        console.log(info);
        user.forgetPasswordToken = 1;
        user.save();
        return res.send(
          "<h1 style='text-align:center;color: tomato; margin-top:10%'><span style='font-size:60px;'>✔️</span> <br />Email Sent! Check your inbox , <br/>check spam in case not found in inbox.</h1>"
        );
      });
      // ------------------------------
    })
    .catch((err) => {
      res.send(err);
    });
});

router.get("/set-password/:id", function (req, res, next) {
  res.render('setpassword', { title: "Socailmedia | Forget-password", id: req.params.id })
});

router.post("/set-password/:id", function (req, res) {
  User.findById(req.params.id)
    .then((user) => {
      if (user.forgetPasswordToken === 1) {
        user.setPassword(req.body.password, function (err) {
          if (err) return res.send(err);
          user.forgetPasswordToken = 0;
          user.save();
          res.redirect("/signout");
        });
      } else {
        res.send(
          "Link Expired! <a href='/forget-password'>Try Again.</a>"
        );
      }
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
