const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/users.js");
const user = require("../models/user.js");

// signUp:
router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

// signUp:
// router.get("/signup",userController.renderSignupForm);

// router.post("/signup",wrapAsync(userController.signup));

// signUp:
router.route("/signup")
    .get(userController.renderLoginForm)
    .post( saveRedirectUrl,

    // actual login part
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }), 
    // actual login part

    userController.login
);

// login:
router.get("/login",userController.renderLoginForm);

router.post("/login", 
    saveRedirectUrl,

    // actual login part
    passport.authenticate("local", {
        failureRedirect: "/login",
        failureFlash: true
    }), 
    // actual login part

    userController.login
);

// logout:
router.get("/logout", userController.logout);

module.exports = router;