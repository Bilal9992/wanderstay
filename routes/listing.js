const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Middleware & Controllers
const {
  isLoggedIn,
  isOwner,
  validateListing,
  isAuthor,
} = require("../middleware.js");

const listingController = require("../controllers/listings.js");

// ✅ INDEX + CREATE
router
  .route("/")
  .get(wrapAsync(listingController.index)) // Show all listings
  .post(
    isLoggedIn,
    upload.single("listing[image]"), // Handle image upload
    validateListing,                 // Validate form data
    wrapAsync(listingController.createListing) // Controller logic
  );

// ✅ NEW FORM (must come before :id route)
router.get("/new", isLoggedIn, listingController.renderNewForm);

// ✅ SHOW, UPDATE, DELETE
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing)) // Show single listing
  .put(
    isLoggedIn,
    isOwner, // Owner must come before updating
    upload.single("listing[image]"), // Handle new image (if uploaded)
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  );

// ✅ EDIT FORM
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
