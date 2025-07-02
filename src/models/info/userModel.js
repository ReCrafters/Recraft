const mongoose = require('mongoose');
const BaseUser = require('./baseUser');

const userSchema = new mongoose.Schema({
  address: {
    type: String,
    default: '',
  },

  orderHistory: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Order'
  }],

  greenBits: {
    type: Number,
    default: 0,
  },

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

  
lastPostDate: {
  type: Date,
  default: null,
}

});

const UserModel = BaseUser.discriminator('user', userSchema);

module.exports = UserModel;
