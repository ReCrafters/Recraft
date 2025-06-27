const express = require('express');
const router = express.Router();
const qrInfoController = require('../controllers/qrInfo');
const wrapAsync = require('../util/wrapAsync');
const { isLoggedIn } = require('../middleware');

router.route('/create/:id')
    .get((req,res)=>{res.render('qrForm')})
    .post(wrapAsync(qrInfoController.createQRInfo));

router.route('/generate/:id')
    .get( wrapAsync(qrInfoController.generateQR));
module.exports = router;