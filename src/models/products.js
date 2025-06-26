const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true
  },

  name: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  images: [
    {
      type: String, // URLs from Cloudinary/multer
      required: true
    }
  ],

  price: {
    type: Number,
    required: true,
    min: 0
  },

  category: {
    type: String,
    enum: [
      'Clothing',
      'Accessories',
      'Home Decor',
      'Beauty',
      'Fitness',
      'Stationery',
      'Electronics',
      'Food',
      'Kitchenware',
      'Toys',
      'Footwear',
      'Bags',
      'Furniture',
      'Others'
    ],
    required: true
  },
  

  stock: {
    type: Number,
    required: true,
    min: 0
  },

  tags: [String],

  isVerified: {
    type: Boolean,
    default: false
  },

  verifiedDocuments: [String], // URLs (e.g., certificate uploads)

  verifiedAt: {
    type: Date
  },

  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'BaseUser' // role = admin
  },

  qrCodeLink: {
    type: String, // Link to Cloudinary/QR image
    default: ''
  },

  views: {
    type: Number,
    default: 0
  },

  purchases: {
    type: Number,
    default: 0
  },

  rating: {
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviews: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'BaseUser'
        },
        rating: {
          type: Number,
          min: 1,
          max: 5
        },
        comment: String
      }
    ]
  },
  
},
{
    timestamps: true
});

productSchema.methods.calculateAvgRating = function () {
  const reviews = this.rating.reviews;
  if (reviews.length === 0) {
    this.rating.avgRating = 0;
  } else {
    const sum = reviews.reduce((total, r) => total + r.rating, 0);
    this.rating.avgRating = sum / reviews.length;
  }
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
