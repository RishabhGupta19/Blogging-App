const { Router } = require('express');
const router = Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const blog = require('../models/blog');
const comment = require('../models/comment');
require('dotenv').config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Multer Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads`));
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

// Route to Add Blog
router.get('/addblog', (req, res) => {
  return res.render('addblog', {
    user: req.user
  });
});

// Route to View Blog by ID
router.get('/:id', async (req, res) => {
  const blog1 = await blog.findById(req.params.id).populate("createdBy");
  const comments = await comment.find({ blogId: req.params.id }).populate("createdBy");

  return res.render("blog", {
    user: req.user,
    blog1,
    comments
  });
});

// Route to Delete Blog
router.post('/delete/:id', async (req, res) => {
  try {
    await blog.findByIdAndDelete(req.params.id);
    return res.redirect('/');
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res.status(500).send("Internal Server Error");
  }
});

// Route to Create Blog with Cloudinary
router.post('/blog', upload.single('coverImage'), async (req, res) => {
  try {
    const { title, body } = req.body;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Store Cloudinary URL in MongoDB
    await blog.create({
      body,
      title,
      createdBy: req.user.id,
      coverImage: result.secure_url
    });

    return res.redirect('/');
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).send("Internal Server Error");
  }
});

// Route to Add Comment
router.post('/Comment/:blogId', async (req, res) => {
  try {
    await comment.create({
      content: req.body.content,
      blogId: req.params.blogId,
      createdBy: req.user.id
    });
    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
