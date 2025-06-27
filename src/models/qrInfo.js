const mongoose = require('mongoose');
const { Schema } = mongoose;

const qrInfoSchema = new Schema({
  productID: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    unique: true
  },
  ingredients: [String],
  transportationMethod: String,
  carbonEmissionsEstimate: String,
  packagingMaterial: String,
  isPlasticFreePackaging: Boolean,
  endOfLifeInstructions: String,
  lifespanEstimate: String,
  renewableEnergyUsedInManufacturing: Boolean,
  localCollectorNetwork: Boolean,
  notesToConsumer: String,
  qrVersion: {
    type: String,
    default: 'v1.0'
  },
  qrGeneratedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('QRInfo', qrInfoSchema);
