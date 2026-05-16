require("dotenv").config();

const express = require("express");
const session = require("express-session");
const path = require("path");
const flash = require("connect-flash");

const passport = require("./config/passport");

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");
const likeRoutes = require("./routes/likeRoutes");
const commentRoutes = require("./routes/commentRoutes");
const followRoutes = require("./routes/followRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

/* =========================
   MIDDLEWARE
========================= */

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

/* =========================
   SESSION
========================= */

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

/* =========================
   PASSPORT
========================= */

app.use(passport.initialize());
app.use(passport.session());

/* =========================
   FLASH
========================= */

app.use(flash());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.errorMessages = req.flash("error");
  next();
});

/* =========================
   ROUTES
========================= */

app.use("/", authRoutes);
app.use("/", postRoutes);
app.use("/", likeRoutes);
app.use("/", commentRoutes);
app.use("/", followRoutes);
app.use("/", userRoutes);
app.use("/", chatRoutes);

/* =========================
   HOME
========================= */

app.get("/", (req, res) => {
  res.render("index");
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});