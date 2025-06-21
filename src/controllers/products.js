
const Product = require('../models/products.js');
module.exports.index= async (req, res) => {
    try{
        const products = await Product.find({});
        res.json(products);
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

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
      images,
      stock,
      tags,
      isVerified = false, 
      verifiedDocuments = [],
      qrCodeLink = ''
    } = req.body;
    if (!name || !price || !category || !stock) {
      return res.status(400).json({ error: 'Required fields: name, price, category, stock' });
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
    try{
        const product = await Product.findById(req.params.id);
        if(!product){
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
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
        res.json({ message: 'Product deleted successfully' });
    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

