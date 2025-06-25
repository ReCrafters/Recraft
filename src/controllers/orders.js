const Order = require('../models/orders');
module.exports.placeOrder = async (req, res) => {
  const { userId, cart, paymentMethod } = req.body;
  const {
    fullName,
    phone,
    address,
    city,
    state,
    pincode
  } = req.body;
  if (
    !userId ||
    !cart || cart.length === 0 ||
    !fullName || !phone || !address || !city || !state || !pincode
  ) {
    return res.status(400).json({ error: 'Missing or invalid order details' });
  }
  const shippingDetails = {
    fullName,
    phone,
    address,
    city,
    state,
    pincode
  };
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const newOrder = new Order({
    userId,
    items: cart,
    shippingDetails,
    paymentMethod,
    totalAmount,
    paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid'
  });
  await newOrder.save();
  res.json({ message: 'Order placed successfully', orderId: newOrder._id });
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