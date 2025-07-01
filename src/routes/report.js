const express = require('express');
const router = express.Router();
const {isLoggedIn, isAdmin} = require('../middleware');
const reportController= require('../controllers/report')

router.route('/')
    .get(isAdmin, reportController.getReport)
    .post(isLoggedIn, reportController.newReport)

router.patch('/:id', isAdmin, reportController.updateReport);

module.exports = router;