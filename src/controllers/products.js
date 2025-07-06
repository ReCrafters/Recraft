
const Product = require('../models/products.js');
const Form = require('../models/form.js');
const User= require('../models/info/userModel');
const {getCombinedProductData} = require('../util/productService.js');
const SellerModel = require('../models/info/sellerModel.js');
const cloudinary = require('../config/cloudinary');
module.exports.index = async (req, res) => {
  try {
    const products = await getCombinedProductData();
    res.render('products.ejs', {products, req});
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
    const verifiedDocuments = [];
    if (req.files?.images?.length > 0) {
      req.files.images.forEach(file => {
        images.push(file.path); 
      });
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
    try {
        const { id } = req.params;
        const { name, description, price, category, stock, tags, deletedImages } = req.body;
        const product = await Product.findById(id);
        if (!product) {
            req.flash('error', 'Product not found');
            return res.redirect('/products');
        }
        if (deletedImages && deletedImages.length > 0) {
            const deletedImagesArray = JSON.parse(deletedImages);
            for (let url of deletedImagesArray) {
                const publicId = url.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`recraft/${publicId}`);
            }
            product.images = product.images.filter(img => !deletedImagesArray.includes(img));
        }
        if (req.files && req.files.images) {
          const newImages = req.files.images.map(f => f.path); 
          product.images.push(...newImages);
        }
        if (req.files && req.files.verifiedDocuments) {
            const newDocs = req.files.verifiedDocuments.map(f => f.path);
            product.verifiedDocuments.push(...newDocs);
        }
        product.name = name;
        product.description = description;
        product.price = price;
        product.category = category;
        product.stock = stock;
        product.tags = [JSON.stringify(tags.split(',').map(tag => tag.trim()))];
        await product.save();
        req.flash('success', 'Product updated successfully');
        res.redirect(`/seller/products/${product._id}`);
        
    } catch (err) {
        console.error(err);
        req.flash('error', 'Failed to update product');
        res.redirect(`/products/${req.params.id}/edit`);
    }
};

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

module.exports.createOrUpdateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId = req.user._id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
     const existingReview = product.rating.reviews.find(r => r.userId.toString() === userId.toString());
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      product.rating.reviews.push({ userId, rating, comment });
    }
    await product.calculateAvgRating();
    res.status(200).json({ message: 'Review submitted', avgRating: product.rating.avgRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports.showReview = async (req,res)=>{
  try{
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const reviews = product.rating.reviews;
    res.json(reviews);
  }catch(err){
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
        req.flash('error', 'Product not found');
        return res.redirect('/products');
    }
    
    res.render('seller/editProduct', { product , user: req.user});
};