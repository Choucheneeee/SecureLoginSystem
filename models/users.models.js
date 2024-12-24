const mongo = require('mongoose')
const bcrypt=require("bcrypt")

var schemaAuth = mongo.Schema({
    username: String,
    phone: Number,
    email: String,
    password: String,
    verif: Boolean,
    verificationCode: String,          // Stores the verification code
    verificationCodeExpires: Date,    // Expiration time for the code
});
const nodemailer = require("nodemailer");
const crypto = require("crypto");


var User = mongo.model("User", schemaAuth);
const url=process.env.url
console.log("url cha",url)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
});
exports.registerFunModel = (name, email, password, phone) => {
    return new Promise((resolve, reject) => {
        mongo.connect(url, {
            serverSelectionTimeoutMS: 80000,
            socketTimeoutMS: 90000,
        })
            .then(() => {
                return User.findOne({ email: email });
            })
            .then((existingUser) => {
                if (existingUser) {
                    mongo.disconnect();
                    reject("The email address is already in use. Please try logging in.");
                } else {
                    return bcrypt.hash(password, 10);
                }
            })
            .then((hashedPassword) => {
                // Generate a verification code
                const verificationCode = crypto.randomBytes(4).toString("hex"); // 8-character code
                const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

                let user = new User({
                    username: name,
                    email: email,
                    password: hashedPassword,
                    phone: phone,
                    verif: false,
                    verificationCode: verificationCode,
                    verificationCodeExpires: verificationCodeExpires,
                });
                return user.save();
            })
            .then((user) => {
                if (user) {
                
                    // Send verification email
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: "Email Verification",
                        text: `Your verification code is: ${user.verificationCode}`,
                    };
                    console.log(mailOptions,'mailoption')

                    return transporter.sendMail(mailOptions).then(() => {
                        mongo.disconnect();
                        resolve("User registered successfully. Please check your email for the verification code.");
                    });
                }
            })
            .catch((err) => {
                mongo.disconnect();
                reject(err);
            });
    });
};

exports.loginFunModel=(email,password)=>{
    // test email if exit 
    //(true go to login)
    //(false add this user to collection)

    return new Promise((resolve,reject)=>{
        mongo.connect(url).then(()=>{
            console.log("connected from auth.js")

            console.log("Successfully connected to the database for login.");
            return User.findOne({email:email})

        }).then((user)=>{
            if(user){
                console.log("User exists");
                bcrypt.compare(password,user.password).then((verif)=>{
                    if(verif){  
                        mongo.disconnect()
                        resolve(user._id)
                    }   
                    else{
                        mongo.disconnect()
                        reject('The password entered is incorrect.');
                    }
                })
            } 
            else{
                    mongo.disconnect()
                    console.log("Disconnect from auth.js")
                    reject('Invalid email address.');
                }
            
           
            
        }).catch((err)=>{
            mongo.disconnect()
            console.log("Disconnect from auth.js")

            reject(err)
            })
        
            })
        }


exports.verifyEmail = (email, code) => {
            return new Promise((resolve, reject) => {
                mongo.connect(url)
                    .then(() => {
                        return User.findOne({ email: email });
                    })
                    .then((user) => {
                        if (!user) {
                            mongo.disconnect();
                            reject("User not found.");
                        } else if (user.verif) {
                            mongo.disconnect();
                            reject("User is already verified.");
                        } else if (user.verificationCode !== code) {
                            mongo.disconnect();
                            reject("Invalid verification code.");
                        } else if (new Date() > user.verificationCodeExpires) {
                            mongo.disconnect();
                            reject("Verification code has expired.");
                        } else {
                            user.verif = true;
                            user.verificationCode = undefined; // Clear the code
                            user.verificationCodeExpires = undefined;
                            return user.save();
                        }
                    })
                    .then(() => {
                        mongo.disconnect();
                        resolve("Email verified successfully.");
                    })
                    .catch((err) => {
                        mongo.disconnect();
                        reject(err);
                    });
            });
        };
