const Form = require('../models/form');
const Product = require('../models/products');
module.exports.index = async (req, res) => {
  const forms = await Form.find({});
  res.json(forms);
};

module.exports.createForm = async (req, res) => {
  try {
    if (!req.isAuthenticated() || req.user.role !== 'seller') {
      return res.status(401).json({ error: 'Unauthorized: Only sellers can submit forms.' });
    }
    const { productID, metrices } = req.body;
    if (!productID || !metrices) {
      return res.status(400).json({ error: 'productID and metrices are required.' });
    }
    const sellerID = req.user._id; 
    const newForm = new Form({
      productID,
      sellerID,
      metrices
    });
    await newForm.save();
    res.status(201).json({ message: 'Form submitted successfully.', form: newForm });
  } catch (err) {
    console.error('Error creating form:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/* Kindly Ignore this- it is for api checking as it is not secured

module.exports.createForm = async (req, res) => {
  try {
    const { productID, metrices, sellerID } = req.body;
    if (!productID || !metrices) {
      return res.status(400).json({ error: 'productID and metrices are required.' });
    }
    const newForm = new Form({
      productID,
      sellerID,
      metrices
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
    res.json({ message: 'Form deleted successfully.' });
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
    res.json({ message: 'Form reviewed successfully.', form });
  } catch (err) {
    console.error('Error reviewing form:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

