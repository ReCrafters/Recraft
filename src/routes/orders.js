const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orders.js');
const { isLoggedIn } = require('../middleware.js');

router.route('/checkout')
  .get(isLoggedIn, orderController.renderCheckout)
  .post(isLoggedIn, orderController.placeOrder);

router.route('/payment')  
    .get(isLoggedIn, orderController.renderPayment)

router.route('/:id')
  .get(isLoggedIn, orderController.showOrder)
  .put(isLoggedIn, orderController.updateOrder)
  .delete(isLoggedIn, orderController.deleteOrder);

module.exports = router;
