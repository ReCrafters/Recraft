const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const formSchema = new Schema({
  productID: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sellerID: {
    type: Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true
  },
  metrices: {
    isRecycledMaterial: { type: Boolean, default: false },
    recycledPercentage: { type: Number, min: 0, max: 100, default: 0 },
    isBiodegradable: { type: Boolean, default: false },
    isReusable: { type: Boolean, default: false },
    energyUsedForProduction: { type: String, default: '' },
    waterUsageLevel: { type: String, default: '' },
    isHandmade: { type: Boolean, default: false },
    isLocallySourced: { type: Boolean, default: false },
    ecoCertification: [{ type: String }], 
    additionalComments: { type: String, default: '' }
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'BaseUser' 
  },
  reviewedAt: {
    type: Date
  },
  assignedSSV: {
    type: Number,
    min: 1,
    max: 100
  },
  assignedTSV: {
    type: Number,
    min: 1,
    max: 100
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  feedback: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Form', formSchema);
