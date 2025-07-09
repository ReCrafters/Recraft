const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },

  shippingDetails: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String
  },

  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      name: String,
      price: Number,
      quantity: Number,
      sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'seller' } 
    }
  ],

  totalAmount: Number,

  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },

  paymentMethod: {
    type: String,
    enum: ['COD', 'UPI', 'Card', 'Wallet'],
    default: 'COD'
  },

  orderStatus: {
    type: String,
    enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered'],
    default: 'Processing'
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
