const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.js');
const wrapAsync = require('../util/wrapAsync');
const upload = require('../config/multer');

router.route('/')
    .get(wrapAsync(productsController.index))
    .post(  
        upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'qrCodeLink', maxCount: 1 },
        { name: 'verifiedDocuments', maxCount: 3 }
    ]),wrapAsync(productsController.createProduct))

router.route('/newProduct')
    .get(productsController.newProduct)

router.route('/:id')
    .get(wrapAsync(productsController.showProduct))
    .put(wrapAsync(productsController.updateProduct))
    .delete(wrapAsync(productsController.deleteProduct))

module.exports = router;