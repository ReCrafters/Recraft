const mongoose = require('mongoose');
const BaseUser = require('./baseUser'); 

const SellerSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
  },

  businessType: {
    type: String, //Have to create enum for this
    required: true,
  },

  gstNumber: {
    type: String,
    required: true,
    unique: true,
  },

  inventory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product' 
  }],

  sustainabilityForms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form' 
  }],

  badge: {
    type: String, 
    default: 'Unverified', //Have to create enum for this
  },

  certificationDocs: [{
    type: String, 
  }],

  analytics: {
    totalSales: {
      type: Number,
      default: 0,
    },
    avgTSV: {
      type: Number,
      default: 0,
    },
    avgSSV: {
      type: Number,
      default: 0,
    }
  }
});

const SellerModel = BaseUser.discriminator('seller', SellerSchema);

module.exports = SellerModel;
