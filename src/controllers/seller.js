const {getSellerData, calculateProductAnalytics} = require('../util/sellerCombinedData.js')
const mongoose= require('mongoose');
const {ObjectId}= mongoose.Types;
const Product= require('../models/products.js');
const Form= require('../models/form.js');
module.exports.sellerDashboard= async(req, res) => {
  const sellerId= req.user._id;
  const sellerData = await getSellerData(sellerId);
  res.render('seller/sellerDashboard.ejs', {seller: sellerData, user:req.user});
}

module.exports.inventory= async(req, res) => {
  const sellerId= req.user._id;
  const sellerData = await getSellerData(sellerId);
  res.render('seller/inventory.ejs', {seller: sellerData, user:req.user});
}

module.exports.form= async(req, res) => {
  const sellerId= req.user._id;
  const sellerData = await getSellerData(sellerId);
  res.render('seller/forms.ejs', {seller: sellerData, user:req.user});
}

module.exports.productPage= async(req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('sellerId', 'name email image')
            .lean();
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/seller/inventory');
        }
        if (product.sellerId._id.toString() !== req.user._id.toString()) {
            req.flash('error', 'You are not authorized to view this product');
            return res.redirect('/seller/inventory');
        }
        const sustainabilityForm = await Form.findOne({
            productID: product._id,
            sellerID: req.user._id
        }).lean();
        const reviewsWithUsers = await Promise.all(
            product.rating.reviews.map(async review => {
                const user = await User.findById(review.userId.$oid).select('name').lean();
                return {
                    ...review,
                    user: {
                        name: user?.name || 'Deleted User'
                    },
                    createdAt: new ObjectId(review._id.$oid).getTimestamp()
                };
            })
        );

        res.render('seller/sellerProduct', {
            title: `${product.name} | Seller Dashboard`,
            product: {
                ...product,
                rating: {
                    avgRating: product.rating.avgRating,
                    reviews: reviewsWithUsers
                }
            },
            user: req.user,
            sustainabilityForm
        });

    } catch (err) {
        console.error('Error fetching product:', err);
        req.flash('error', 'Error loading product details');
        res.redirect('/seller/inventory');
    }
}

module.exports.productAnalytics= async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findOne({
            _id: productId,
            sellerId: req.user._id
        });
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found or unauthorized' });
        }
        
        const analyticsData = await calculateProductAnalytics(productId);
        
        res.json(analyticsData);
    } catch (err) {
        console.error('Error fetching analytics data:', err);
        res.status(500).json({ error: 'Error loading analytics data' });
    }
}