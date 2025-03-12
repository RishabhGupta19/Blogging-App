const {Router} = require('express');
const User = require('../models/user');
const multer = require('multer');
const path = require('path');
const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(`./public/Images`)); 
    },
    filename: function (req, file, cb) {
        const filename = `${Date.now()}-${file.originalname}`;
        cb(null, filename);
    },
});
const upload = multer({ storage:storage });



router.get('/signin', (req, res) => {
    res.render("signin");
});

router.get('/signup', (req, res) => {
    res.render("signup");
});

router.post('/signin', async (req, res) => {
    try{const {email, password} = req.body;
    const token = await User.matchpassword(email, password);
    
    return res.cookie("token",token).redirect('/');}
    catch(error){
        
       return res.render("signin",{error: "Invalid Email or Password",} );
    }
});
router.get('/logout', (req, res) => {
    res.clearCookie("token").render("signin");
});

router.post('/signup', upload.single('profilePhoto'), async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        // Check if all fields are filled
        if (!fullName || !email || !password) {
            return res.status(400).send("All fields are required.");
        }

        // Set profile photo path
        const profilePhoto = req.file ? `/Images/${req.file.filename}` : "/Images/Profile.jpg";
        console.log(req.file);
        console.log(profilePhoto);
        // Create user
        await User.create({ fullName, email, password, profilePhoto });

        res.redirect('signin');  // Redirect after successful signup
    } catch (error) {
        console.error(error);
        res.status(500).send('Error signing up');
    }
});



module.exports = router;