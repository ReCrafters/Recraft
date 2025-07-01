const User = require('../models/info/baseUser');
const cloudinary = require('../config/cloudinary');

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

module.exports.updateUserPhoto = async (req, res) => {
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

module.exports.deleteUserPhoto = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.image) {
      const publicId = user.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        invalidate: true 
      });
    }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        image: null,
        updatedAt: new Date()
      },
      { new: true }
    );
    res.json({ message: 'Profile photo deleted', user: updatedUser });
  } catch (err) {
    console.error('Error deleting photo:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports.follow= async (req, res) => {
  try {
    const userId = req.params.id;
    const currentUserId = req.user._id;
    if (userId === currentUserId.toString()) {
      return res.status(400).json({ error: "You can't follow yourself" });
    }

    const userToFollow = await User.findById(userId);
    const currentUser = await User.findById(currentUserId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isFollowing = currentUser.following.includes(userId);

    if (isFollowing) {
      // Unfollow
      currentUser.following.pull(userId);
      userToFollow.followers.pull(currentUserId);
    } else {
      // Follow
      currentUser.following.push(userId);
      userToFollow.followers.push(currentUserId);
    }

    await Promise.all([currentUser.save(), userToFollow.save()]);

    res.json({
      success: true,
      action: isFollowing ? 'unfollowed' : 'followed',
      followingCount: currentUser.following.length,
      followersCount: userToFollow.followers.length,
      isFollowing: !isFollowing, 
      wasFollowing: isFollowing  
    });

  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports.getFollowing= async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username profileImage')
      .select('following');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.following);
  } catch (error) {
    console.error('Error getting following list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username profileImage')
      .select('followers');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.followers);
  } catch (error) {
    console.error('Error getting followers list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}