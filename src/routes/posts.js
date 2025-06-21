const express = require('express');
const router = express.Router();
const wrapAsync = require('../util/wrapAsync.js');
const postController = require('../controllers/posts.js');

router.route('/')
  .get(wrapAsync(postController.index))
  .post(wrapAsync(postController.createPost));

router.route('/:id')
  .get(wrapAsync(postController.showPost))
  .delete(wrapAsync(postController.deletePost));

module.exports = router;