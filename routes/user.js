const { Router } = require('express');
const User = require('../models/user');
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

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(`./public/Images`));
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

// Route to Sign In Page
router.get('/signin', (req, res) => {
  res.render("signin");
});

// Route to Sign Up Page
router.get('/signup', (req, res) => {
  res.render("signup");
});

// Route to Handle Sign In
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const token = await User.matchpassword(email, password);

        // Set the cookie with `httpOnly` and `maxAge` for persistent login
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,   
            maxAge: 7 * 24 * 60 * 60 * 1000  // Expires in 7 days
        });

        return res.redirect('/');
    } catch (error) {
        return res.render("signin", { error: "Invalid Email or Password" });
    }
});


// Route to Handle Logout
router.get('/logout', (req, res) => {
  res.clearCookie("token").render("signin");
});

// Route to Handle Sign Up with Cloudinary
router.post('/signup', upload.single('profilePhoto'), async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

  
    if (!fullName || !email || !password) {
      return res.status(400).send("All fields are required.");
    }

  
    let profilePhoto = "/Images/Profile.jpg"; 

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      profilePhoto = result.secure_url;
    }

   
    await User.create({ fullName, email, password, profilePhoto });

    res.redirect('signin'); 
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).send('Error signing up');
  }
});

module.exports = router;
