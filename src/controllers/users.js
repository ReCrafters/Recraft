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
      age
    } = req.body;

    // Base fields for all users
    const newUserData = {
      email,
      username,
      name,
      phone,
      role,
      age
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

module.exports.showUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  res.json(user);
};

module.exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
  res.json(updatedUser);
};

module.exports.updateProfilePhoto = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const imagePath = req.file.path; 
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        image: imagePath,
        updatedAt: new Date(),
      },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Profile photo updated', user: updatedUser });
  } catch (err) {
    console.error('Error uploading photo:', err);
    res.status(500).json({ message: 'Server error' });
  }
};