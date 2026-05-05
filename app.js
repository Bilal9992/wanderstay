if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
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
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// ✅ ENV variables
const dbUrl = process.env.ATLASDB_URL;
const secret = process.env.SECRET || "fallbackSecret";
const port = process.env.PORT || 8080;

// ✅ Safety check (VERY IMPORTANT)
if (!dbUrl) {
  console.error("❌ ATLASDB_URL is missing in environment variables");
  process.exit(1);
}

// ✅ MongoDB Connection
async function main() {
  try {
    await mongoose.connect(dbUrl);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
main();

// ✅ View engine
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

// ✅ Mongo Session Store
const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: secret,
  },
  touchAfter: 24 * 60 * 60,
});

store.on("error", (err) => {
  console.error("❌ SESSION STORE ERROR:", err);
});

// ✅ Session config
const sessionOptions = {
  store,
  secret: secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: Date.now() + 1000 * 60 * 60 * 24 * 3,
    maxAge: 1000 * 60 * 60 * 24 * 3,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ✅ Passport config
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ✅ Global locals middleware
app.use((req, res, next) => {
  res.locals.currUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ✅ Routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// ✅ Home route (optional)
app.get("/", (req, res) => {
  res.send("🚀 WanderStay is running!");
});

// ✅ 404 handler
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

// ✅ Error handler
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).send(message);
});

// ✅ Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});