
const Product = require('../models/products.js');
const Form = require('../models/form.js');
const User = require('../models/info/baseUser.js')

module.exports.getCombinedProductData= async () => {
  // Find all products and populate reviews with user data
  const products = await Product.find({})
    .populate({
      path: 'rating.reviews.userId',
      select: 'username profileImage', // Include only username and profileImage
      model: 'BaseUser' 
    });

  const productIds = products.map(p => p._id);
  const forms = await Form.find({ productID: { $in: productIds } });

  const formMap = {};
  forms.forEach(form => {
    formMap[form.productID.toString()] = form;
  });
  const combined = products.map(product => {
    const prodObj = product.toObject();
    prodObj.form = formMap[product._id.toString()] || null;
    if (prodObj.rating?.reviews) {
      prodObj.rating.reviews = prodObj.rating.reviews.map(review => {
        return {
          ...review,
          user: review.userId ? {
            username: review.userId.username,
            image: review.userId.profileImage
          } : null
        };
      });
    }
    
    return prodObj;
  });

  return combined;
};
