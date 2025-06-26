const Order = require('../models/orders');
const User = require('../models/info/userModel');
const Seller = require('../models/info/sellerModel');

module.exports.placeOrder = async (req, res) => {
  try {
    const userId = req.user._id; 
    const { cart, paymentMethod } = req.body;
    const { fullName, phone, address, city, state, pincode } = req.body;
    if (
      !cart || cart.length === 0 ||
      !fullName || !phone || !address || !city || !state || !pincode
    ) {
      return res.status(400).json({ error: 'Missing or invalid order details' });
    }
    const shippingDetails = { fullName, phone, address, city, state, pincode };
    const items = cart.map(item => ({
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      sellerId: item.sellerId,
    }));
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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
    const uniqueSellers = [...new Set(items.map(i => i.sellerId.toString()))];
    await Promise.all(
      uniqueSellers.map(sellerId =>
        Seller.findByIdAndUpdate(sellerId, {
          $push: { salesHistory: newOrder._id }
        })
      )
    );
    res.json({ message: 'Order placed successfully', orderId: newOrder._id });
  } catch (err) {
    console.error('Order placement error:', err);
    res.status(500).json({ error: 'Failed to place order' });
  }
};


module.exports.renderCheckout = (req, res) => {
  res.render('checkout.ejs');
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