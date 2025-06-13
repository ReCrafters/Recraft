const express = require('express');
const router = express.Router();
const passport = require('passport');
const wrapAsync = require('../util/wrapAsync.js');
const userController = require('../controllers/users.js');

// Login routes
router.route('/login')
  .get(userController.renderLogin)
  .post(
    passport.authenticate('local', {
      failureRedirect: '/users/login',
      console: true,
      failureFlash: 'Invalid username or password',
    }),
    (req, res) => {
      req.flash('success', 'Welcome back!');
      res.redirect('/dashboard');
    }
  );

// Signup routes
router.route('/signup')
  .get(userController.renderSignUp)
  .post(wrapAsync(userController.signup));

// Logout route
router.get('/logout', userController.logout);



module.exports = router;
