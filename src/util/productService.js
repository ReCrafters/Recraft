
const Product = require('../models/products.js');
const Form = require('../models/form.js');

const getCombinedProductData = async () => {
  const products = await Product.find({});
  const productIds = products.map(p => p._id);
  const forms = await Form.find({ productID: { $in: productIds } });

  const formMap = {};
  forms.forEach(form => {
    formMap[form.productID.toString()] = form;
  });

  const combined = products.map(product => {
    const prodObj = product.toObject();
    prodObj.form = formMap[product._id.toString()] || null;
    return prodObj;
  });

  return combined;
};

module.exports = { getCombinedProductData };
