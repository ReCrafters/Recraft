const Order = require('../models/orders');
const User = require('../models/info/userModel');
const Seller = require('../models/info/sellerModel');
const Cart = require('../models/cart')

module.exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user._id; 
    const { paymentMethod, fullName, phone, address, city, state, pincode } = req.body;
    let cartItems;
    try {
      cartItems = JSON.parse(req.body.cart);
    } catch (err) {
      console.error('Cart parse error:', err);
      return res.status(400).json({ error: 'Invalid cart data' });
    }
    if (!cartItems || cartItems.length === 0 || 
        !fullName || !phone || !address || !city || !state || !pincode) {
      return res.status(400).json({ error: 'Missing or invalid order details' });
    }
    const shippingDetails = { fullName, phone, address, city, state, pincode };
    const items = cartItems.map(item => ({
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      sellerId: item.sellerId || null
    }));
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const newOrder = await Order.create({
      userId,
      items,
      shippingDetails,
      paymentMethod,
      totalAmount,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid'
    });
    await User.findByIdAndUpdate(userId, {
      $push: { orderHistory: newOrder._id }
    });
    const sellerUpdates = items
      .filter(item => item.sellerId)
      .map(item => 
        Seller.findByIdAndUpdate(item.sellerId, {
          $push: { salesHistory: newOrder._id }
        })
      );
    await Promise.all(sellerUpdates);
    res.json({'message':'completed'});
  } catch (err) {
    console.error('Order placement error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
};


module.exports.renderCheckout = async (req, res) => {
  const userId = req.user;
  const cart = await Cart.findOne({userId}).populate({
        path: 'items._id',  
        select: 'images[0]'  
      });
    if (!cart || cart.items.length === 0) {
      req.flash('error', 'Your cart is empty');
      return res.redirect('/cart');
    }
    console.log(cart);
  const totalAmount = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    res.render('checkout', {
      cartItems: cart.items, 
      totalAmount,
      user: req.user,
      cartId: cart._id 
    });
};

module.exports.showOrder = async (req, res) => {
  const orderId = req.params.id;
  const order = await Order.findById(orderId).populate('userId', 'username');
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
};

module.exports.updateOrder = async (req, res) => {
  const orderId = req.params.id;
  const { orderStatus } = req.body;
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus },
    { new: true }
  );
  if (!updatedOrder) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(updatedOrder);
};

module.exports.deleteOrder = async (req, res) => {
  const orderId = req.params.id;
  const deletedOrder = await Order.findByIdAndDelete(orderId);
  if (!deletedOrder) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json({ message: 'Order deleted successfully' });
};

module.exports.renderPayment = (req, res) => {
  res.render('payment.ejs');
};