const mongoose = require('mongoose');
const { Schema } = mongoose;

// In models/Post.js
const likeSchema = new Schema({
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const commentSchema = new Schema({
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new Schema({
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true
  },
  caption: {
    type: String,
    trim: true
  },
  media: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'video', 'raw'],
      required: true
    }
  }],
  likes: [likeSchema],        // Array of like objects
  comments: [commentSchema],  // Array of comment objects
  views: {
    type: Number,
    default: 0
  },
  reports: [{
    type: Schema.Types.ObjectId,
    ref: 'Report'
  }],
  category: {
    type: String,
    required: true
  },
  materialType: {
    type: String,
    trim: true
  },
  impactScore: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

postSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Post', postSchema);
