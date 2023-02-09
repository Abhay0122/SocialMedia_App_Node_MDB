const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: String,
    password: String,
    dob: String,
    gender:{
      type:String, 
    }, 
    avatar: {
        type: String,
        default: "dummy.png",
    },
});

userSchema.plugin(plm, { usernameField: "email" });


const User = mongoose.model("User", userSchema);

module.exports = User;


