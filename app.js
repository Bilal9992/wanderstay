if(process.env.Node_ENV!="production"){
  require('dotenv').config()

}



const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;
const port = 8080;

// ✅ DB connection
// ✅ DB connection
async function main() {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,                        // enforce TLS
      tlsAllowInvalidCertificates: false,
      serverSelectionTimeoutMS: 5000,   // optional: avoids long hangs
    });
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
main().catch((err) => console.log(err));

// ✅ Middleware
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret:process.env.SECRET,
  },
  touchAfter: 24 * 60 * 60, // Only update once every 24 hours
});

store.on("error", (err) => {
  console.error("❌ SESSION STORE ERROR", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
    maxAge: 1000 * 60 * 60 * 24 * 3,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 3️⃣ Locals middleware — AFTER passport.session()
app.use((req, res, next) => {
  res.locals.currUser = req.user;   // ✅ safe here
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ✅ Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// ✅ Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
