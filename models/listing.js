const mongoose = require("mongoose");
const review = require("./review");
const Schema = mongoose.Schema;


const listingSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: {
    url: String,
    filename:String
  },
  price: Number,
  location: String,
  country: String,
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId, // ✅ fixed
      ref: "Review", // if you have a Review model
    },
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref:"User",
  },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.DeleteMany({ _id: { $in: listing.reviews } });
  }
});

module.exports = mongoose.model("Listing", listingSchema);
