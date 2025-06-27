const QRCode = require('qrcode');
const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');
const Product = require('../models/products');
const Form = require('../models/form');
const QRInfo = require('../models/qrInfo');
const { noSniff } = require('helmet');

module.exports.generateQR = async (productID) => {
  try {
    const product = await Product.findById(productID).populate('sellerId');
    if (!product) {
      throw new Error('Product not found');
    }
    const scanRedirectURL = `$https://qrinterface.onrender.com/${productID}`;
    const qrBase64 = await QRCode.toDataURL(scanRedirectURL);
    const base64Data = qrBase64.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const stream = Readable.from(buffer);
    const uploadResult = await new Promise((resolve, reject) => {
      const streamUpload = cloudinary.uploader.upload_stream(
        {
          folder: 'recraft/qrcodes',
          resource_type: 'image'
        },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      stream.pipe(streamUpload);
    });
    product.qrCodeLink = uploadResult.secure_url;
    await product.save();
    return {
      qrCodeLink: uploadResult.secure_url,
      qrRedirectURL: scanRedirectURL
    };
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw err;
  }
};