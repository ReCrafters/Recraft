module.exports.isLoggedIn= (req, res, next)=> {
  if (req.isAuthenticated()) return next();
  req.flash("error", "You must be logged in");
  res.redirect("/");
}

module.exports.isSeller = (req, res, next) => {
  if (!req.isAuthenticated() || req.user.role !== 'seller') {
    req.flash('error', 'Seller access required');
    return res.redirect('/login');
  }
  next();
};

module.exports.verifyProductOwner = async (req, res, next) => {
  try {
    const product = await Product.findById(req.body.productID);
    if (!product || product.seller.toString() !== req.user._id.toString()) {
      req.flash('error', 'Invalid product selection');
      return res.redirect('/form');
    }
    next();
  } catch (err) {
    console.error(err);
    req.flash('error', 'Product verification failed');
    res.redirect('/form');
  }
};