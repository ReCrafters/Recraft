const express = require('express');
const router = express.Router();
const Cart = require('../models/cart.js');

router.get('/', async (req, res) => {
    res.render('cart', { user: req.user });
});

// Sync cart from frontend
router.post('/sync', async (req, res) => {
  const { userId, cart } = req.body;
  const existingCart = await Cart.findOne({ userId });

  if (existingCart) {
    existingCart.items = cart;
    await existingCart.save();
    return res.json({ message: 'Cart updated' });
  } else {
    const newCart = new Cart({ userId, items: cart });
    await newCart.save();
    return res.json({ message: 'Cart created' });
  }
});

// Get cart by user ID
router.get('/:userId', async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId });
  res.json(cart || { items: [] });
});

module.exports = router;
