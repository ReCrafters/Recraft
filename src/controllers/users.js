const User = require('../models/info/baseUser');

module.exports.renderSignUp = (req, res) => {
  res.render('signup.ejs');
};

module.exports.renderLogin = (req, res) => {
  res.render('login.ejs');
};

module.exports.signup = async (req, res, next) => {
  try {
    const {
      username,
      email,
      name,
      phone,
      password,
      role,
      address,
      businessName,
      businessType,
      gstNumber,
      employeeId,
      designation,
    } = req.body;

    // Base fields for all users
    const newUserData = {
      email,
      username,
      name,
      phone,
      role,
    };

    // Role-specific fields
    if (role === 'user') {
      newUserData.address = address || '';
    } else if (role === 'seller') {
      newUserData.businessName = businessName || '';
      newUserData.businessType = businessType || '';
      newUserData.gstNumber = gstNumber || '';
    } else if (role === 'admin') {
      newUserData.employeeId = employeeId || '';
      newUserData.designation = designation || '';
    }

    const newUser = new User(newUserData);
    const registeredUser = await User.register(newUser, password);

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", "You are successfully registered!");
      return res.redirect('/dashboard');
    });

  } catch (e) {
    console.error("Signup Error:", e);
    req.flash("error", e.message);
    return res.redirect("/users/signup");
  }
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.flash("success", "You are logged out now");
    return res.render("landingPage.ejs");
  });
};

