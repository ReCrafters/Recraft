const express = require('express');
const router = express.Router();
const Form = require('../models/form');
const wrapAsync = require('../util/wrapAsync');
const formController = require('../controllers/form');
const upload = require('../config/multer');

router.route('/')
  .get(wrapAsync(formController.index))
  .post(upload.array('certifications', 5),wrapAsync(formController.createForm));

router.route('/newForm')
  .get(formController.newForm);


router.route('/:id')
  .get(wrapAsync(formController.showForm))
  .put(upload.array('certificationFiles', 5),wrapAsync(formController.updateForm))
  .delete(wrapAsync(formController.deleteForm));

router.route('/:id/review')
  .put(wrapAsync(formController.reviewForm));



module.exports = router;
