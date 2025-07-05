const express = require('express');
const router = express.Router();
const {isLoggedIn, isSeller} = require('../middleware');
const sellerController= require('../controllers/seller.js');

router.get('/', isLoggedIn, sellerController.sellerDashboard);
router.get('/inventory', isLoggedIn, sellerController.inventory)
router.get('/form', isLoggedIn, sellerController.form)
router.get('/products/:id', isLoggedIn, sellerController.productPage);
router.get('/products/:id/analytics', isLoggedIn, sellerController.productAnalytics);

module.exports= router;