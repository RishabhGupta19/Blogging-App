const {Router} = require('express');
const router = Router();
const multer=require('multer');
const path = require('path');
const blog = require('../models/blog')
const comment= require('../models/comment')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve(`./public/uploads`));
    },
    filename: function (req, file, cb) {
      const filename =` ${Date.now()}-${file.originalname}`;
      cb(null, filename);
    },
  });
  
  const upload = multer({ storage: storage })


router.get('/addblog', (req, res) => {
    return res.render('addblog',{
    user: req.user});
});

router.get('/:id', async(req,res) =>{
  const blog1 = await blog.findById(req.params.id).populate("createdBy");
 const comments = await comment.find({blogId:req.params.id}).populate("createdBy");
 
  return res.render("blog",{
    user:req.user,
    blog1,
    comments,
  });
});
router.post('/delete/:id', async (req, res) => {
  
  try {
      await blog.findByIdAndDelete(req.params.id);

      return res.redirect('/');
  } catch (error) {
      console.error("Error deleting blog:", error);
      return res.status(500).send("Internal Server Error");
  }
});


router.post('/blog',upload.single('coverImage') ,async(req, res) => {
    const {title,body}=req.body;
    console.log(req.user.id);
    console.log(req.file.filename);
   const Blog = await blog.create({
      body,
      title,
      createdBy: req.user.id,
      coverImage: `/uploads/${req.file.filename}`,
    });
    
    return res.redirect('/');
});

router.post('/Comment/:blogId', async (req,res)=>{
  await comment.create({
    content:req.body.content,
    blogId: req.params.blogId,
    createdBy:req.user.id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
})

module.exports = router;