const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose"); // ✅ fixed typo

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

// ✅ plugin goes on schema, not model
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema); // ✅ export model
