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
    await qrGenerate.generateQR(productID);
    res.status(201).json({ message: 'QR info saved successfully and Qr code generated successfully.', qrInfo });
  } catch (err) {
    console.error('QR Info Creation Error:', err);
    res.status(500).json({ error: 'Failed to save QR info' });
  }
};


