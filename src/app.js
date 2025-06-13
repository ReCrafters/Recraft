const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const MongoStore = require("connect-mongo");
require("dotenv").config();

// DB Utils
const connectDB = require("./config/db");

// Base Model for login
const BaseUser = require("./models/info/baseUser.js");

// Role-specific models
const User = require("./models/info/userModel");
const Seller = require("./models/info/sellerModel");
const Admin = require("./models/info/adminModel");

// Middleware and Helper
const { isLoggedIn } = require("./middleware.js");

// Routes
const userRouter = require("./routes/users.js"); // handle signup logic inside based on role

const app = express();
const port = process.env.PORT;

// Connect DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session and Flash Config
app.use(session({
  secret: process.env.secret,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 60 * 60 * 24 * 15
  }),
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 15
  }
}));

app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// Passport Config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(BaseUser.authenticate()));
passport.serializeUser(BaseUser.serializeUser());
passport.deserializeUser(BaseUser.deserializeUser());

//Route 1: Role-based login/signup routes
app.use('/users', userRouter);

// Auth Check
app.get('/check-auth', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: "User not authenticated" });
  }
});

// Dashboard (example of role-based dashboard redirection)
app.get('/dashboard', isLoggedIn, (req, res) => {
  const role = req.user.role;
  if (role === 'admin') return res.redirect('/admin-dashboard');
  if (role === 'seller') return res.redirect('/seller-dashboard');
  return res.render('homePage.ejs', { user: req.user });
});

// Public Landing Page
app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  res.render('landingPage');
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
