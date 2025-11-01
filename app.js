require('dotenv').config()

const express = require('express');
const path = require("path");
const app = express();
const favicon = require('serve-favicon');
const PORT = process.env.PORT || 3000;
const userroutes = require('./routes/user');
const blogRoute = require('./routes/blog');
const updates = require('./routes/updates');
const blog = require('./models/blog')
const cookiparser = require('cookie-parser');
const checkAuthenticationCookie = require('./middleware/authentication');


const mongoose = require('mongoose');
app.set('view engine', 'ejs');
app.set('views', path.resolve("./views")); 

mongoose.connect(process.env.MONGO_URL).then(e => {
    console.log("Connected to database");
});
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(cookiparser());
app.use(checkAuthenticationCookie("token"));
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.resolve('./public')));



app.get('/', async (req, res) => {
  try {
    const allblogs = await blog.find({}); // Populate user info
    res.render("home", { user: req.user || null, blogs: allblogs });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading blogs");
  }
});


app.use("/user", userroutes);
app.use("/blog", blogRoute);
app.use("/updates",updates);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
