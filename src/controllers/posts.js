const Post = require('../models/posts.js');
const User= require('../models/info/baseUser.js')

module.exports.index = async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('userID', 'username image')
      .populate({
        path: 'comments.userID',
        select: 'username image'
      })
      .lean();
    res.render('posts.ejs', {
      posts,
      currentUser: req.user,
      moment: require('moment')
    });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json(err);
  }
};

module.exports.createPost = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false,
        error: 'User not authenticated',
        message: 'Please login to create a post'
      });
    }
    const { caption, category, materialType, location } = req.body;
    let parsedLocation;
    try {
      parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      
      if (!parsedLocation || 
          !parsedLocation.coordinates || 
          !Array.isArray(parsedLocation.coordinates) ||
          parsedLocation.coordinates.length !== 2) {
        throw new Error('Invalid location format');
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location',
        message: 'Please provide valid location coordinates [lng, lat]'
      });
    }
    if (!caption || !caption.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Missing caption',
        message: 'Caption is required'
      });
    }
    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Missing category',
        message: 'Please select a category'
      });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No media files',
        message: 'Please upload at least one media file'
      });
    }
    const mediaFiles = req.files.map(file => ({
      url: file.path,
      type: file.mimetype.startsWith('video') ? 'video' : 
            file.mimetype.startsWith('image') ? 'image' : 'raw'
    }));
    const post = new Post({
      userID: req.user._id,
      caption: caption.trim(),
      media: mediaFiles,
      category,
      materialType: materialType?.trim() || undefined, 
      location: parsedLocation
    });
    await post.save();
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'Associated user account not found'
      });
    }

    // Streak Logic
    const today =new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); 
    const recentPosts = await Post.find({
      userID: req.user._id,
      createdAt: { $gte: sevenDaysAgo }
    });
    const uniquePostDays = new Set(
      recentPosts.map(post => {
        const d = new Date(post.createdAt);
        d.setHours(0, 0, 0, 0); // Normalize to midnight
        return d.getTime();
      })
    );
    if (uniquePostDays.size === 0) {
      user.streakCount = 0; 
    } else {
      user.streakCount += 1; 
      const greenBitsToAward = Math.floor(user.streakCount / 100) - Math.floor((user.streakCount - 1) / 100);
      if (greenBitsToAward > 0) {
        user.greenBits += greenBitsToAward;
      }
    }
    user.posts.push(post._id);
    user.lastPostDate = today;
    await user.save();
    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: post.toObject(),
      streakCount: user.streakCount,
      greenBits: user.greenBits
    });
  } catch (err) {
    console.error('Post Creation Error:', err);
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid post data',
        details: errors
      });
    }
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Duplicate post',
        message: 'This post already exists'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server Error',
      message: 'Failed to create post. Please try again later.'
    });
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

module.exports.uploadPost= async (req, res)=>{
  console.log(req.user);
  try {
    res.render('uploadPost.ejs');
  } catch (err) {
    console.error('Error loading post upload form:', err);
    res.status(500).send('Internal Server Error');
  }
}

module.exports.likePost = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized',
        message: 'Please log in to like posts'
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Post not found'
      });
    }

    const userId = req.user._id;
    const existingLikeIndex = post.likes.findIndex(
      like => like.userID && like.userID.toString() === userId.toString()
    );

    if (existingLikeIndex >= 0) {
      post.likes.splice(existingLikeIndex, 1);
    } else {
      post.likes.push({
        userID: userId,
        timestamp: new Date()
      });
    }

    await post.save();

    return res.json({
      success: true,
      liked: existingLikeIndex < 0,
      likesCount: post.likes.length,
      message: existingLikeIndex >= 0 ? 'Post unliked' : 'Post liked'
    });

  } catch (err) {
    console.error('Error in likePost:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to process like'
    });
  }
};

// Add comment
module.exports.addComment = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized',
        message: 'Please log in to comment'
      });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Post not found'
      });
    }

    const comment = {
      userID: req.user._id,
      text: req.body.text,
      timestamp: new Date()
    };

    post.comments.push(comment);
    await post.save();

    // Populate user info
    const newComment = post.comments[post.comments.length - 1];
    await Post.populate(newComment, { path: 'userID', select: 'username image' });

    return res.json({
      success: true,
      comment: newComment,
      commentsCount: post.comments.length,
      message: 'Comment added'
    });

  } catch (err) {
    console.error('Error in addComment:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to add comment'
    });
  }
};

module.exports.deleteComment = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized',
        message: 'Please log in to delete comments'
      });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Post not found'
      });
    }

    const commentIndex = post.comments.findIndex(
      c => c._id.toString() === req.params.commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: 'Comment not found'
      });
    }

    // Check if user owns the comment or is admin
    const comment = post.comments[commentIndex];
    if (!comment.userID.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only delete your own comments'
      });
    }

    post.comments.splice(commentIndex, 1);
    await post.save();

    return res.json({
      success: true,
      commentsCount: post.comments.length,
      message: 'Comment deleted'
    });

  } catch (err) {
    console.error('Error in deleteComment:', err);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to delete comment'
    });
  }
};

// In your post controller
exports.incrementViews = async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.postId,
            { $inc: { views: 1 } }, // Increment views by 1
            { new: true }
        );
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        res.status(200).json({ views: post.views });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.savedPosts= async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('savedPosts');
    res.json(user.savedPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports.savePost= async (req, res) => {
  try {
    // Verify post exists
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Get the authenticated user
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if post is already saved
    const postIndex = user.savedPosts.findIndex(savedPostId => 
      savedPostId.toString() === req.params.postId
    );

    if (postIndex === -1) {
      // Save the post
      user.savedPosts.push(req.params.postId);
      await user.save();
      return res.json({ 
        success: true,
        action: 'saved',
        savedPosts: user.savedPosts
      });
    } else {
      // Unsave the post
      user.savedPosts.splice(postIndex, 1);
      await user.save();
      return res.json({ 
        success: true,
        action: 'unsaved',
        savedPosts: user.savedPosts
      });
    }
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}