// WARNING: THIS IS THE BASE USER SCHEMA FOR ALL USERS REGARDLESS OF ROLE, SO DO NOT ALTER THIS SCHEMA

const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const baseUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  username: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  phone: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ['user', 'seller', 'admin'],
    required: true,
  },

  image: {
    type: String,
    default: '',
  },

  age: {
    type: Number,
    min: 0,
  },

  savedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    default: []
  }],

  
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
  }],

  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser'  
  }],

  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser'  
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },

  bio:{
    type:String,
    default:'No Bio'
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'users',
  discriminatorKey: 'role',
},{ timestamps: true });

baseUserSchema.plugin(passportLocalMongoose, {
  usernameField: 'email', // Use 'email' as login identifier
});

module.exports = mongoose.model('BaseUser', baseUserSchema);
