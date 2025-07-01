const express = require('express');
const router = express.Router();
const wrapAsync = require('../util/wrapAsync.js');
const postController = require('../controllers/posts.js');
const upload = require('../config/multer');
const { isLoggedIn } = require('../middleware.js');

// All posts
router.route('/')
  .get(wrapAsync(postController.index))
  .post(isLoggedIn, upload.array('media', 5), wrapAsync(postController.createPost));

// New post upload form
router.get('/newPost', isLoggedIn, wrapAsync(postController.uploadPost));

// Saved posts
router.get('/saved', isLoggedIn, wrapAsync(postController.savedPosts));
router.post('/:id/save', isLoggedIn, wrapAsync(postController.savePost));

// Post details
router.route('/:id')
  .get(wrapAsync(postController.showPost))
  .delete(isLoggedIn, wrapAsync(postController.deletePost));

// Post interactions
router.post('/:id/like', isLoggedIn, wrapAsync(postController.likePost));
router.post('/:id/comment', isLoggedIn, wrapAsync(postController.addComment));
router.delete('/:postId/comment/:commentId', isLoggedIn, wrapAsync(postController.deleteComment));
router.post('/:postId/view', wrapAsync(postController.incrementViews));

module.exports = router;
