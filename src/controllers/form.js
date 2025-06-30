const Form = require('../models/form');
const Product = require('../models/products');
const SellerModel = require('../models/info/sellerModel');
const adminModel = require('../models/info/adminModel');
module.exports.index = async (req, res) => {
  const forms = await Form.find({});
  res.json(forms);
};

module.exports.createForm = async (req, res) => {
  try {
    if (!req.isAuthenticated() || req.user.role !== 'seller') {
      req.flash('error', 'Unauthorized: Only sellers can submit forms.');
      return res.status(401).redirect('/login');
    }
    const {       
      productID,
      isRecycled,
      recycledPercent,
      isBiodegradable,
      isReusable,
      isLocal,
      isHandmade,
      energyUsed,
      waterUsed,
      comments
    } = req.body;
    if (!productID) {
      req.flash('error', 'Product ID is required.');
      return res.redirect('/form'); 
    }
    const existingForm = await Form.findOne({ productID });
    if (existingForm) {
      req.flash('error', 'Form already exists. Please update it.');
      return res.status(200).json({ redirectTo: `/form/${existingForm._id}` });
    }
    const sellerID = req.user._id; 
    const certificationPDFs = req.files?.map(file => file.path) || [];
    const metrices = {
      isRecycledMaterial: isRecycled === 'true',
      recycledPercentage: isRecycled === 'true' ? parseInt(recycledPercent || '0') : 0,
      isBiodegradable: isBiodegradable === 'true',
      isReusable: isReusable === 'true',
      isLocallySourced: isLocal === 'true',
      isHandmade: isHandmade === 'true',
      energyUsedForProduction: parseFloat(energyUsed),
      waterUsageLevel: parseFloat(waterUsed),
      ecoCertification: certificationPDFs,
      additionalComments: comments || ''
    };
    const newForm = new Form({
      productID,
      sellerID,
      metrices  
    });
    await newForm.save();
    await SellerModel.findByIdAndUpdate(sellerID, { $push: { sustainabilityForms: newForm._id } });
    req.flash('success', 'Form submitted successfully.');
    res.status(201).json({ message: 'Form submitted successfully.' });
  } catch (err) {
    console.error('Error creating form:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      details: err.message 
    });
  }
};
/* Kindly Ignore this- it is for api checking as it is not secured

module.exports.createForm = async (req, res) => {
  try {
    const { productID, metrices, sellerID } = req.body;
    if (!productID || !metrices) {
      return res.status(400).json({ error: 'productID and metrices are required.' });
    }
    const parsedMetrices = typeof metrices === 'string' ? JSON.parse(metrices) : metrices;
    const certificationPDFs = req.files?.map(file => file.path) || [];
    parsedMetrices.ecoCertification = certificationPDFs;
    const newForm = new Form({
      productID,
      sellerID,
      metrices: parsedMetrices
    });
    await newForm.save();
    res.status(201).json({ message: 'Form submitted successfully.', form: newForm });
  } catch (err) {
    console.error('Error creating form:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
*/

module.exports.showForm = async (req, res) => {
  const form = await Form.findById(req.params.id);
  if (!form) {
    return res.status(404).json({ error: 'Form not found' });
  }
  res.json(form);
};

module.exports.updateForm = async (req, res) => {
  const { id } = req.params;
  const { productID, metrices, sellerID } = req.body;
  const updatedForm = await Form.findByIdAndUpdate(
    id,
    { productID, metrices, sellerID },
    { new: true }
  );
  if (!updatedForm) {
    return res.status(404).json({ error: 'Form not found' });
  }
  res.json(updatedForm);
};

module.exports.deleteForm = async (req, res) => {
  try {
    const { id } = req.params;
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    const productExists = await Product.exists({ _id: form.productID });
    if (productExists) {
      return res.status(400).json({ error: 'Cannot delete form: related product still exists.' });
    }
    await Form.findByIdAndDelete(id);
        if (form.sellerID) {
      await sellerModel.findByIdAndUpdate(
        form.sellerID,
        { $pull: { sustainabilityForms: form._id } }
      );
    }
    res.status(201).json({ message: 'Form deleted successfully.' });
  } catch (err) {
    console.error('Error deleting form:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* Kindly Ignore this- it is for api checking as it is not secured
module.exports.reviewForm = async (req, res) => {
  const { id } = req.params;
  const { reviewerID, isApproved, feedback, assignedTSV, assignedSSV} = req.body;
  const form = await Form.findById(id);
  if (!form) {
    return res.status(404).json({ error: 'Form not found' });
  }
  if (form.reviewedBy) {
    return res.status(400).json({ error: 'Form has already been reviewed' });
  }
  form.reviewedBy = reviewerID;
  form.reviewedAt = new Date();
  form.isApproved = isApproved;
  form.feedback = feedback;
  form.assignedTSV = assignedTSV;
  form.assignedSSV = assignedSSV;
  await form.save();
  res.json(form);
};
*/

module.exports.reviewForm = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved, feedback, assignedTSV, assignedSSV } = req.body;
    if (!req.isAuthenticated() || req.user.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized: Only admins can review forms.' });
    }
    const reviewerID = req.user._id;
    const form = await Form.findById(id);
    if (!form) {
      return res.status(404).json({ error: 'Form not found' });
    }
    if (form.reviewedBy) {
      return res.status(400).json({ error: 'Form has already been reviewed.' });
    }
    form.reviewedBy = reviewerID;
    form.reviewedAt = new Date();
    form.isApproved = isApproved;
    form.feedback = feedback;
    form.assignedTSV = assignedTSV;
    form.assignedSSV = assignedSSV;
    await form.save();
    await adminModel.findByIdAndUpdate(
      form.reviewerID,
      { $push: { verificationHistory: form._id } }
    );
    res.json({ message: 'Form reviewed successfully.', form });
  } catch (err) {
    console.error('Error reviewing form:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports.newForm = async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'seller') {
      req.flash('error', 'Unauthorized: Only sellers can submit forms.');
      return res.status(401).redirect('/users/login');
    }
    const sellerID = req.user._id;
    const products= await Product.find({ sellerId: sellerID });
  res.render('sellerForm.ejs', { products });
};
