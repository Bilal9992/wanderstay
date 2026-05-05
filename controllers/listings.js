const Listing = require("../models/listing");

// ✅ INDEX — Show all listings
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};

// ✅ NEW FORM
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

// ✅ SHOW — View a single listing
module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" },
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
};

// ✅ CREATE — Add new listing
module.exports.createListing = async (req, res) => {
  if (!req.file) {
    req.flash("error", "Please upload an image!");
    return res.redirect("/listings/new");
  }

  const { path: url, filename } = req.file;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

// ✅ EDIT FORM
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested does not exist!");
    return res.redirect("/listings");
  }

  // Resize preview for editing page
  let originalImageUrl = listing.image.url.replace("/upload", "/upload/w_250");
  res.render("listings/edit", { listing, originalImageUrl });
};

// ✅ UPDATE — Edit existing listing
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (req.file) {
    const { path: url, filename } = req.file;
    listing.image = { url, filename };
    await listing.save(); // ✅ fixed typo (was “lsiting”)
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// ✅ DELETE
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
