const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportSchema = new Schema({
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true
  },
  reportedEntity: {
    type: Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  detail: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'rejected'], // optional enum
    default: 'pending'
  },
  actionTaken: {
    type: String
  },
  handledBy: {
    type: Schema.Types.ObjectId,
    ref: 'BaseUser'
  },
  adminComment: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  handledAt: {
    type: Date
  }
});

module.exports = mongoose.model('Report', reportSchema);
