const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resource_type = 'image'; 
    if (file.mimetype.startsWith('video/')) {
      resource_type = 'video';
    } else if (file.mimetype === 'application/pdf') {
      resource_type = 'raw'; 
    }

    return {
      folder: 'recraft',
      resource_type,
      allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'pdf'],
    };
  },
});

const upload = multer({ storage });
module.exports = upload;

