const express = require('express');
const router = express.Router();
const Form = require('../models/form');
const wrapAsync = require('../util/wrapAsync');
const formController = require('../controllers/form');

router.route('/')
  .get(wrapAsync(formController.index))
  .post(wrapAsync(formController.createForm));

router.route('/:id')
  .get(wrapAsync(formController.showForm))
  .put(wrapAsync(formController.updateForm))
  .delete(wrapAsync(formController.deleteForm));

router.route('/:id/review')
  .put(wrapAsync(formController.reviewForm));


module.exports = router;
