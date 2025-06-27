const QRInfo = require('../models/qrInfo');
const Product = require('../models/products');
const Form= require('../models/form');  
const { cloudinary } = require('../config/cloudinary');
const QRcode= require('qrcode');
const {Readable} = require('stream');
const qrGenerate= require('../util/qrCodeGenerate');


module.exports.createQRInfo = async (req, res) => {
  try {
    const productID = req.params.id;
    const exists = await QRInfo.findOne({ productID });
    if (exists) {
      return res.status(400).json({ error: 'QR info already submitted for this product.' });
    }
    const qrInfo = new QRInfo({
      productID,
      ...req.body
    });
    await qrInfo.save();
    res.status(201).json({ message: 'QR info saved successfully.', qrInfo });
  } catch (err) {
    console.error('QR Info Creation Error:', err);
    res.status(500).json({ error: 'Failed to save QR info' });
  }
};

module.exports.generateQR = async (req, res) => {
  try {
    const productID = req.params.id;
    qrGenerate.generateQR(productID);
    res.status(200).json({ message: 'QR code generated successfully.' });
  }catch (err) {
    console.error('QR Generation Error:', err);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
  };



