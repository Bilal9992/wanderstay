const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  comment: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now, // ✅ function reference, not invocation
  },
  author: {
    type: Schema.Types.ObjectId, // ✅ fixed capitalization
    ref: "User", // ✅ must match your User model name
  },
});

module.exports = mongoose.model("Review", reviewSchema);
