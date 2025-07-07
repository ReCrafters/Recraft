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
    energySourceType: [{ type: String, enum: ['Grid', 'Solar', 'Wind', 'Hydro', 'Biomass', 'Generator', 'Coal', 'Manual'] }],
    totalEnergyUsedKWh: { type: Number, min: 0 },
    renewableEnergyPercentage: { type: Number, min: 0, max: 100 },
    energySavingPractices: [{ type: String }], 
    waterSourceType: [{ type: String, enum: ['Municipal', 'Borewell', 'Rainwater', 'Recycled', 'River/Lake', 'Tanker'] }],
    totalWaterUsedLitres: { type: Number, min: 0 },
    waterPerUnitLitres: { type: Number, min: 0 },
    waterReusedPercentage: { type: Number, min: 0, max: 100 },
    hasRainwaterHarvesting: { type: Boolean, default: false },
    hasWaterRecyclingSystem: { type: Boolean, default: false },
    wastewaterDisposalMethod: { type: String, default: '' },
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
