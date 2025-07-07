const Form = require('../models/form');
const Product = require('../models/products');
const SellerModel = require('../models/info/sellerModel');
const adminModel = require('../models/info/adminModel');
const cloudinary = require('../config/cloudinary');
const { isAdmin } = require('../middleware');
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
    const { productID, metrices } = req.body;
    if (!productID) {
      req.flash('error', 'Product ID is required.');
      return res.redirect('/seller/form'); 
    }
    const existingForm = await Form.findOne({ productID });
    if (existingForm) {
      req.flash('error', 'Form already exists. Please update it.');
      return res.redirect(`/form/${existingForm._id}`);
    }
    const sellerID = req.user._id;
    const certificationUrls = req.files?.length > 0 
      ? await Promise.all(req.files.map(file => 
          cloudinary.uploader.upload(file.path, {
            folder: 'recraft/certifications',
            resource_type: 'auto'
          }).then(result => result.secure_url)
        ))
      : [];
    const newMetrics = {
      isRecycledMaterial: metrices.isRecycledMaterial === 'on',
      recycledPercentage: metrices.isRecycledMaterial === 'on' 
        ? parseInt(metrices.recycledPercentage || '0') 
        : 0,
      isBiodegradable: metrices.isBiodegradable === 'on',
      isReusable: metrices.isReusable === 'on',
      energySourceType: Array.isArray(metrices.energySourceType) 
        ? metrices.energySourceType 
        : (metrices.energySourceType ? [metrices.energySourceType] : []),
      totalEnergyUsedKWh: parseFloat(metrices.totalEnergyUsedKWh) || 0,
      renewableEnergyPercentage: parseFloat(metrices.renewableEnergyPercentage) || 0,
      energySavingPractices: metrices.energySavingPractices 
        ? metrices.energySavingPractices.split(',').map(item => item.trim()) 
        : [],
      waterSourceType: Array.isArray(metrices.waterSourceType) 
        ? metrices.waterSourceType 
        : (metrices.waterSourceType ? [metrices.waterSourceType] : []),
      totalWaterUsedLitres: parseFloat(metrices.totalWaterUsedLitres) || 0,
      waterPerUnitLitres: parseFloat(metrices.waterPerUnitLitres) || 0,
      waterReusedPercentage: parseFloat(metrices.waterReusedPercentage) || 0,
      hasRainwaterHarvesting: metrices.hasRainwaterHarvesting === 'on',
      hasWaterRecyclingSystem: metrices.hasWaterRecyclingSystem === 'on',
      wastewaterDisposalMethod: metrices.wastewaterDisposalMethod || '',
      isHandmade: metrices.isHandmade === 'on',
      isLocallySourced: metrices.isLocallySourced === 'on',
      ecoCertification: certificationUrls,
      additionalComments: metrices.additionalComments || ''
    };
    const newForm = new Form({
      productID,
      sellerID,
      metrices: newMetrics
    });
    await newForm.save();
    await SellerModel.findByIdAndUpdate(sellerID, { 
      $push: { sustainabilityForms: newForm._id } 
    });
    req.flash('success', 'Form submitted successfully.');
    res.redirect('/seller/form');
  } catch (err) {
    console.error('Error creating form:', err);
    req.flash('error', 'Failed to submit form: ' + err.message);
    res.redirect('/seller/form');
  }
};

module.exports.showForm = async (req, res) => {
    const { id } = req.params;
    const form = await Form.findById(id).populate('productID');
    if (!form) {
        req.flash('error', 'Sustainability form not found');
        return res.redirect('/seller/products');
    }
    const product = await Product.findById(form.productID._id);
    res.render('seller/editForm', { form, product, user:req.user });
};

module.exports.updateForm = async (req, res) => {
  try {
    if (!req.isAuthenticated() || req.user.role !== 'seller') {
      req.flash('error', 'Unauthorized: Only sellers can update forms.');
      return res.status(401).redirect('/login');
    }

    const { id } = req.params;
    const { 
      metrices 
    } = req.body;
    const form = await Form.findById(id);
    if (!form) {
      req.flash('error', 'Form not found');
      return res.redirect('/seller/form');
    }
    if (form.sellerID.toString() !== req.user._id.toString()) {
      req.flash('error', 'Unauthorized: You can only update your own forms.');
      return res.status(403).redirect('/seller/form');
    }
    const certificationUrls = req.files?.length > 0 
      ? await Promise.all(req.files.map(file => 
          cloudinary.uploader.upload(file.path, {
            folder: 'recraft/certifications',
            resource_type: 'auto'
          }).then(result => result.secure_url)
        ))
      : [];
    const updatedMetrics = {
      isRecycledMaterial: metrices.isRecycledMaterial === 'on',
      recycledPercentage: metrices.isRecycledMaterial === 'on' ? 
        parseInt(metrices.recycledPercentage || '0') : 0,
      isBiodegradable: metrices.isBiodegradable === 'on',
      isReusable: metrices.isReusable === 'on',
      energySourceType: Array.isArray(metrices.energySourceType) ? 
        metrices.energySourceType : 
        (metrices.energySourceType ? [metrices.energySourceType] : []),
      totalEnergyUsedKWh: parseFloat(metrices.totalEnergyUsedKWh) || 0,
      renewableEnergyPercentage: parseFloat(metrices.renewableEnergyPercentage) || 0,
      energySavingPractices: metrices.energySavingPractices ? 
        metrices.energySavingPractices.split(',').map(item => item.trim()) : [],
      waterSourceType: Array.isArray(metrices.waterSourceType) ? 
        metrices.waterSourceType : 
        (metrices.waterSourceType ? [metrices.waterSourceType] : []),
      totalWaterUsedLitres: parseFloat(metrices.totalWaterUsedLitres) || 0,
      waterPerUnitLitres: parseFloat(metrices.waterPerUnitLitres) || 0,
      waterReusedPercentage: parseFloat(metrices.waterReusedPercentage) || 0,
      hasRainwaterHarvesting: metrices.hasRainwaterHarvesting === 'on',
      hasWaterRecyclingSystem: metrices.hasWaterRecyclingSystem === 'on',
      wastewaterDisposalMethod: metrices.wastewaterDisposalMethod || '',
      isHandmade: metrices.isHandmade === 'on',
      isLocallySourced: metrices.isLocallySourced === 'on',
      ecoCertification: [
        ...(form.metrices.ecoCertification || []),
        ...certificationUrls
      ],
      additionalComments: metrices.additionalComments || ''
    };
    const updatedForm = await Form.findByIdAndUpdate(
      id,
      { 
        metrices: updatedMetrics,
        isApproved: false,
        feedback: ""
      },
      { new: true, runValidators: true }
    );

    req.flash('success', 'Form updated successfully!');
    res.redirect('/seller/form');
  } catch (err) {
    console.error('Error updating form:', err);
    req.flash('error', 'Failed to update form: ' + err.message);
    res.redirect(`/form/${req.params.id}`);
  }
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
