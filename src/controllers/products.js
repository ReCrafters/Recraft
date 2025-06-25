
const Product = require('../models/products.js');
const Form = require('../models/form.js');
const User= require('../models/info/userModel');
const {getCombinedProductData} = require('../util/productService.js');
const SellerModel = require('../models/info/sellerModel.js');
module.exports.index = async (req, res) => {
  try {
    const combined = await getCombinedProductData();
    res.json({ products: combined });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports.createProduct = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).json({ error: 'Unauthorized. Only sellers can add products.' });
    }
    const {
      name,
      description,
      price,
      category,
      stock,
      tags,
      isVerified = false,
    } = req.body;
    if (!name || !price || !category || !stock) {
      return res.status(400).json({ error: 'Required fields: name, price, category, stock' });
    }
    const images = [];
    let qrCodeLink = '';
    const verifiedDocuments = [];
    if (req.files?.images?.length > 0) {
      req.files.images.forEach(file => {
        images.push(file.path); 
      });
    }
    if (req.files?.qrCodeLink?.[0]) {
      qrCodeLink = req.files.qrCodeLink[0].path;
    }
    if (req.files?.verifiedDocuments?.length > 0) {
      const pdfFiles = req.files.verifiedDocuments.filter(file => file.mimetype === 'application/pdf');
      if (pdfFiles.length > 3) {
        return res.status(400).json({ error: 'Maximum 3 verified documents allowed' });
      }
      pdfFiles.forEach(file => verifiedDocuments.push(file.path));
    }
    const sellerId = req.user._id;
    const product = new Product({
      name,
      description,
      price,
      category,
      images,
      stock,
      tags,
      isVerified,
      verifiedDocuments,
      qrCodeLink,
      sellerId
    });
    await product.save();
    await SellerModel.findByIdAndUpdate(
      sellerId,
      { $push: { inventory: product._id } }
    );
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (err) {
    console.error('Product Creation Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


/* Kindly ignore this, it's just for testing
module.exports.createProduct = async (req, res) => {
    try{
        const { name, description, price, category, images, stock, tags, isVerified, verifiedDocuments, qrCodeLink, sellerId} = req.body;
        const product = new Product({ name, description, price, category, images, stock, tags, isVerified, verifiedDocuments, qrCodeLink,sellerId});
        await product.save();
        res.status(201).json(product);
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
*/

module.exports.showProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const form = await Form.findOne({ productID: product._id })
      .sort({ createdAt: -1 }) 
      .lean();
    product.form = form || null;
    res.json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports.updateProduct = async (req, res) => {
    try{
        const { name, description, price, category, images, stock, tags, isVerified, verifiedDocuments, qrCodeLink } = req.body;
        const product = await Product.findByIdAndUpdate(req.params.id, { name, description, price, category, images, stock, tags, isVerified, verifiedDocuments, qrCodeLink }, { new: true });
        if(!product){
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
module.exports.deleteProduct = async (req, res) => {
    try{
        const product = await Product.findByIdAndDelete(req.params.id);
        if(!product){
            return res.status(404).json({ error: 'Product not found' });
        }
        await SellerModel.findByIdAndUpdate(
            product.sellerId,
            { $pull: { inventory: product._id } }
        );
        res.json({ message: 'Product deleted successfully' });
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports.newProduct = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'seller') {
      return res.status(403).send('Unauthorized: Only sellers can upload products.');
    }
    res.render('uploadProduct.ejs');
  } catch (err) {
    console.error('Error loading product upload form:', err);
    res.status(500).send('Internal Server Error');
  }
};