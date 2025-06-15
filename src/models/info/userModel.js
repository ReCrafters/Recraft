const mongoose = require('mongoose');
const BaseUser = require('./baseUser');

const userSchema = new mongoose.Schema({
  address: {
    type: String,
    default: '',
  },

  greenBits: {
    type: Number,
    default: 0,
  },

  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],

  streakCount: {
    type: Number,
    default: 0,
  },

  impactStats: {
    carbonSaved: {
      type: Number,
      default: 0, 
    },
    wasteRecycled: {
      type: Number,
      default: 0,
    },
  },

  leaderboardPoints: {
    type: Number,
    default: 0,
  },

  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],

  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],

});

const UserModel = BaseUser.discriminator('user', userSchema);

module.exports = UserModel;
