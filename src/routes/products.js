const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.js');
const wrapAsync = require('../util/wrapAsync');

router.route('/')
    .get(wrapAsync(productsController.index))
    .post(wrapAsync(productsController.createProduct))

router.route('/:id')
    .get(wrapAsync(productsController.showProduct))
    .put(wrapAsync(productsController.updateProduct))
    .delete(wrapAsync(productsController.deleteProduct))

module.exports = router;