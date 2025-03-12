const jwt = require('jsonwebtoken');
const secret = "mysecret";

function createTokenforUser(user){
    const payload = {
        username: user.fullName,
        id : user._id,
        email : user.email,
        profilePhoto : user.profilePhoto,
        role : user.role,
    };
    const token = jwt.sign(payload, secret);
    return token;
}

function verifyToken(token){
    const payload = jwt.verify(token, secret);
    return payload; }
module.exports = { createTokenforUser, verifyToken };