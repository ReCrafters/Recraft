const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.js');
const wrapAsync = require('../util/wrapAsync');
const upload = require('../config/multer');
const {verifyProductOwner, isLoggedIn} = require('../middleware.js');  
 

router.route('/')
    .get(wrapAsync(productsController.index))
    .post(  
        upload.fields([
        { name: 'images', maxCount: 5 },
        { name: 'verifiedDocuments', maxCount: 3 }
    ]),wrapAsync(productsController.createProduct))

router.route('/newProduct')
    .get(productsController.newProduct)

router.route('/:id')
    .get(wrapAsync(productsController.showProduct))
    .put(
        isLoggedIn,
        verifyProductOwner,
        upload.fields([
            { name: 'images', maxCount: 5 },
            { name: 'verifiedDocuments', maxCount: 3 }
        ]),
        wrapAsync(productsController.updateProduct)
    )
    .delete(verifyProductOwner,wrapAsync(productsController.deleteProduct))

router.route('/:id/edit')
    .get(isLoggedIn,verifyProductOwner,wrapAsync(productsController.renderEditForm));

router.route('/:id/review')
    .get(wrapAsync(productsController.showReview))
    .post(isLoggedIn, wrapAsync(productsController.createOrUpdateReview))

router.route('/:id/info')
    .get(wrapAsync(productsController.showProductInfo));

module.exports = router;