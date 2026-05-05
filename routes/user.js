const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl } = require("../middleware");
const userController = require("../controllers/users");

// --- Signup Routes ---
router
  .route("/signup")
  .get(userController.renderSignupForm)       // Show signup form
  .post(wrapAsync(userController.signup));    // Handle signup

// --- Login Routes ---
router
  .route("/login")
  .get(userController.renderLoginForm)        // Show login form
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login                      // Handle login success
  );

// --- Logout Route ---
router.get("/logout", userController.logout);

module.exports = router;
