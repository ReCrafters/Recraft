const Post = require('../models/posts.js');

module.exports.index = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/* Kindly ignore this, it's just for testing 
module.exports.createPost = async (req, res) => {
  try {
    const {
      caption,
      media,
      category,
      materialType,
      impactScore,
      location,
      userID  // { type: 'Point', coordinates: [lng, lat] }
    } = req.body;

    if (!caption || !category || !location || !location.coordinates) {
      return res.status(400).json({ error: 'Required fields: caption, category, and location' });
    }

    const post = new Post({
    //   userID: req.user._id,  // Automatically from session
      caption,
      media,
      category,
      materialType,
      impactScore,
      location,
      userID
    });

    await post.save();
    res.status(201).json({ message: 'Post created successfully', post });

  } catch (err) {
    console.error('Post Creation Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
*/

module.exports.createPost = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const {
      caption,
      category,
      materialType,
      impactScore,
      location, // { type: 'Point', coordinates: [lng, lat] }
    } = req.body;

    // Parsing of location if sent as string
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

    // Required validation
    if (
      !caption ||
      !category ||
      !parsedLocation ||
      !Array.isArray(parsedLocation.coordinates) ||
      parsedLocation.coordinates.length !== 2
    ) {
      return res.status(400).json({
        error: 'Required fields: caption, category, valid location with coordinates [lng, lat]',
      });
    }
    const mediaFiles = req.files.map(file => ({
      url: file.path,
      type: file.mimetype.startsWith('video') ? 'video' : file.mimetype.startsWith('image') ? 'image' : 'raw'
    }));
    const post = new Post({
      userID: req.user._id,
      caption,
      media: mediaFiles, 
      category,
      materialType: materialType || '',
      impactScore: impactScore || '',
      location: parsedLocation
    });

    await post.save();

    res.status(201).json({
      message: 'Post created successfully',
      post
    });

  } catch (err) {
    console.error('Post Creation Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports.showPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};