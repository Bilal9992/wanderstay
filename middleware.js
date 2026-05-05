const Listing = require("./models/listing");
const Review = require("./models/review"); // ✅ capitalized for clarity
const ExpressError = require("./utils/ExpressError.js");
const { ListingSchema, reviewSchema } = require("./schema.js");

// ✅ Check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create a listing!");
    return res.redirect("/login");
  }
  next();
};

// ✅ Save redirect URL
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

// ✅ Check if the current user owns the listing
module.exports.isOwner = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  if (!listing.owner.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

// ✅ Validate listing data (Joi)
module.exports.validateListing = (req, res, next) => {
  const { error } = ListingSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  }
  next();
};

// ✅ Validate review data (Joi)
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, msg);
  }
  next();
};

// ✅ Check if the current user is the author of the review
module.exports.isAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId); // ✅ fixed

  if (!review) {
    req.flash("error", "Review not found!");
    return res.redirect(`/listings/${id}`);
  }

  if (!review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You didn't create this review!");
    return res.redirect(`/listings/${id}`);
  }

  next();
};
