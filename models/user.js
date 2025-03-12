const {Schema, model} = require("mongoose");
const { createTokenforUser } = require("../services/auth");
const { createHmac, randomBytes } = require("crypto");
const userSchema = new Schema({
    fullName:{
        type : String,
        required : true,
    },
    email : {
        type : String,
        required : true,
        unique : true,
    },
    password : {
        type : String,
        required : true,
    },
    salt: {
        type: String,
        
    },
    profilePhoto: {
        type: String,
        default: "/Images/Profile.jpg",
    },
    role:{
        type: String,
        enum : ["admin", "user"],
        default: "user",
    },
},
    {timesamps: true},
);

userSchema.pre("save", function(next){
const user = this;
if(!user.isModified("password")) return ;

    const salt = randomBytes(16).toString("hex");
    const hash = createHmac('sha256', salt)
                    .update(user.password)
                    .digest('hex');
    
    this.salt = salt;
    this.password = hash;

    next();
});

userSchema.static("matchpassword", async function(email,password){
    const user = await this.findOne({email}); 
        if(!user) throw new Error("No User Found!");
        const salt = user.salt;
        const hashedpass= user.password;
        const userpoivided = createHmac('sha256', salt)
                        .update(password)
                        .digest('hex');
        if(userpoivided !== hashedpass) throw new Error("Password is incorrect");
        const token = createTokenforUser(user);
        return token; 
    
});

const User = model("User", userSchema);
module.exports = User;