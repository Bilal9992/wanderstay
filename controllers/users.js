const User = require("../models/user")

module.exports.renderSignupForm=(req, res) => {
  res.render("users/signup"); // views/users/signup.ejs
}

module.exports.signup= async (req, res, next) => {
    const { username, email, password } = req.body;
    try {
      const newUser = new User({ username, email });
      const registeredUser = await User.register(newUser, password);

      // Auto login
      req.login(registeredUser, (err) => {
        if (err) return next(err);
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  }

  module.exports.renderLoginForm = (req, res) => {
  res.render("users/login");
}

module.exports.login = (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl ||"/listings";
    res.redirect(redirectUrl);
  }



 module.exports.logout=(req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You have logged out!");
    res.redirect("/listings");
  });
}