const Seller = require('../models/info/sellerModel');
const Product = require('../models/products');
const Form = require('../models/form');
const Order = require('../models/orders');
const Post = require('../models/posts');
const QRInfo = require('../models/qrInfo');
const Cart = require('../models/cart')
const mongoose = require('mongoose');
const {ObjectId}= mongoose.Types;

module.exports.getSellerData = async (sellerId) => {
  try {
    const seller = await Seller.findById(sellerId)
      .populate('inventory')
      .populate('salesHistory')
      .populate('sustainabilityForms');
    if (!seller) throw new Error('Seller not found');
    const posts = await Post.find({ userID: sellerId });
    const productsWithScores = await Product.find({ sellerId })
      .populate({
        path: 'sellerId',
        select: 'name email image'
      });
    const forms = await Form.find({ sellerID: sellerId })
      .populate('productID', 'name')
      .populate('reviewedBy', 'name role');
    const orders = await Order.find({ 'items.sellerId': sellerId });
    const qrInfos = await QRInfo.find({ productID: { $in: seller.inventory } });
    return {
      sellerProfile: {
        name: seller.name,
        email: seller.email,
        image: seller.image,
        phone: seller.phone,
        age: seller.age,
        bio: seller.bio,
        role: seller.role,
        createdAt: seller.createdAt,
        updatedAt: seller.updatedAt
      },
      businessDetails: {
        businessName: seller.businessName,
        businessType: seller.businessType,
        gstNumber: seller.gstNumber,
        badge: seller.badge,
        certifications: seller.certificationDocs
      },
      analytics: seller.analytics,
      products: productsWithScores,
      sustainabilityForms: forms,
      orders: orders,
      posts: posts,
      qrDetails: qrInfos
    };

  } catch (err) {
    console.error('Error fetching seller dashboard data:', err);
    throw err;
  }
};

module.exports.calculateProductAnalytics= async(productId)=>{
    const salesData = await Order.aggregate([
        {
            $match: {
                'items.product': new ObjectId(productId),
                status: 'completed',
                createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
            }
        },
        {
            $group: {
                _id: { $month: '$createdAt' },
                count: { $sum: 1 }
            }
        },
        {
            $sort: { '_id': 1 }
        }
    ]);
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const sales = Array(6).fill(0);
    salesData.forEach(item => {
        const monthIndex = (item._id - 1) % 12; // Handle year wrap-around
        const recentMonthIndex = (new Date().getMonth() - 5 + monthIndex) % 12;
        if (recentMonthIndex >= 0 && recentMonthIndex < 6) {
            sales[recentMonthIndex] = item.count;
        }
    });
    
    const product = await Product.findById(productId)
        .select('views purchases rating')
        .lean();
    
    const engagement = {
        views: product.views || 0,
        cartAdds: await Cart.countDocuments({ 'items.product': productId }),
        purchases: product.purchases || 0,
        returns: await Order.countDocuments({ 
            'items.product': productId,
            status: 'returned'
        }),
        reviews: product.rating?.reviews?.length || 0
    };
    
    return {
        sales,
        engagement: [
            engagement.views,
            engagement.cartAdds,
            engagement.purchases,
            engagement.returns,
            engagement.reviews
        ]
    };
}

