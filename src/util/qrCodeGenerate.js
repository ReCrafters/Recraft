const QRCode = require('qrcode');
const { Readable } = require('stream');
const cloudinary = require('../config/cloudinary');
const Product = require('../models/products');
const Form = require('../models/form');
const QRInfo = require('../models/qrInfo');
const { noSniff } = require('helmet');
const BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:8080'

module.exports.generateQR = async (productID) => {
    try{
  const product = await Product.findById(productID).populate('sellerId');
  const form = await Form.findOne({ productID });
  const qrInfo = await QRInfo.findOne({ productID });

  if (!product || !form || !qrInfo) {
    throw new Error('Missing Product, Form, or QRInfo');
  }

  const qrData = {
    productID: product._id,
    name: product.name,
    description: product.description,
    category: product.category,
    price: product.price,
    images: product.images,
    tags: product.tags,
    stock: product.stock,
    sellerId: product.sellerId._id,
    sellerName: product.sellerId.name,
    verifiedDocuments: product.verifiedDocuments,
    verifiedAt: product.verifiedAt,
    verifiedBy: product.verifiedBy,
    sustainability: {
      TSV: form.assignedTSV,
      SSV: form.assignedSSV,
      ...form.metrices
    },
    formReview: {
      reviewedBy: form.reviewedBy,
      reviewedAt: form.reviewedAt,
      isApproved: form.isApproved,
      feedback: form.feedback
    },
    ...qrInfo.toObject(),
    scanRedirectURL: `${BASE_URL}/product/${product._id}`,
    qrGeneratedAt: new Date().toISOString(),
    ingredients: qrInfo.ingredients,
    notesToConsumer: qrInfo.notesToConsumer,
  };

  const qrBase64 = await QRCode.toDataURL(JSON.stringify(qrData));
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
    qrData
  };
}catch(err){
    console.error('Error generating QR code:', err);
    throw err;
}
};
