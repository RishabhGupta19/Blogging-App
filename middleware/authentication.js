const {verifyToken} = require('../services/auth');
function checkAuthenticationCookie(cookieName){
    return (req, res, next) => {
        const tokenCookie = req.cookies[cookieName];
        if(!tokenCookie){
            return next()
        }
        try{
        const payload = verifyToken(tokenCookie);
        req.user = payload;}
        catch(error){
            
        }
        return next();
    }
}
function restrictToLoggedInUserOnly(req,res,next){
    const uid = req.cookies?.uid;
    // console.log(uid);
    if(!uid){
        return res.render("login");
    }
    const user=  getUser(uid);
    //console.log(user);
    if(!user){
        return res.render("login");
    }
    req.user = user;
    next();
    
}
module.exports = checkAuthenticationCookie;