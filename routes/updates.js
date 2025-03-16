const { Router } = require('express');
const User = require('../models/user');
const Blog = require('../models/blog');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const router = Router();
require('dotenv').config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve('./public/Images')); // Save images to public folder
  },
  filename: (req, file, cb) => {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

// Profile Photo Update Route
router.post('/update-profile-photo', upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    
    const result = await cloudinary.uploader.upload(req.file.path);

   
    await User.findByIdAndUpdate(req.user.id, { profilePhoto: result.secure_url });
    console.log(result.secure_url);
    res.redirect('/'); 
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating profile photo.");
  }
});

// Render Profile Page
router.get('/profile', async (req, res) => {
 

  if (!req.user) {
    return res.status(401).send("Unauthorized: No user found.");
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).send("User not found.");
    }

    res.render('profile', { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

/* Editing Blog Router */

router.get('/edit/:id', async (req, res) => {
  try {
    console.log(req.params.id);
    const blog = await Blog.findById(req.params.id);
    if (!blog || blog.createdBy.toString() !== req.user.id) {
      return res.status(403).send("Unauthorized to edit this blog.");
    }
    res.render('editBlog', { blog });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading blog edit page.");
  }
});

// Route to Handle Blog Update
router.post("/edit/:id", async (req, res) => {
  try {
    const { title, content } = req.body;
    const blogId = req.params.id;

    if (!title || !content) {
      return res.status(400).send("Title and Content are required.");
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { title, body: content },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return res.status(404).send("Blog post not found.");
    }

    res.redirect(`/blog/${blogId}`);

  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
