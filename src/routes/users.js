const express = require('express');
const router = express.Router();
const passport = require('passport');
const wrapAsync = require('../util/wrapAsync.js');
const userController = require('../controllers/users.js');
const upload = require('../config/multer');
const User= require('../models/info/baseUser.js')
const {isLoggedIn}= require('../middleware.js')

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

router.route('/:id')
  .get(userController.showUser)
  .put(userController.updateUser);

router.post('/:id/follow', isLoggedIn, userController.follow);

// Get user's following list
router.get('/:id/following', userController.getFollowing);

// Get user's followers list
router.get('/:id/followers', userController.getFollowers);

router.route('/:id/photo')
  .put(upload.single('image'), userController.updateUserPhoto)
  .delete(userController.deleteUserPhoto);


module.exports = router;
