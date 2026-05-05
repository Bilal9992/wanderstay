const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to DB");

  // Run initdb only after successful connection
  await initdb();
}

const initdb = async () => {
  await Listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({
    ...obj,
    owner: "68ea555bbfda135e3176ce56",
  }));

  await Listing.insertMany(initData.data);
  console.log("Database initialized");
};

main().catch((err) => console.log(err));
