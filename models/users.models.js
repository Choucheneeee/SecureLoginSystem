const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const schemaAuth = mongoose.Schema({
    username: String,
    phone: Number,
    email: String,
    password: String,
    verif: Boolean,
    verificationCode: String,
    verificationCodeExpires: Date,
});

const User = mongoose.model("User", schemaAuth);

const url = process.env.url;
console.log("MongoDB URL:", url);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Reusable database connection function
const connectToDatabase = async () => {
    if (mongoose.connection.readyState === 0) { // Only connect if not already connected
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB successfully.');
    }
};

// Registration function
const registerFunModel = async (name, email, password, phone) => {
    try {
        await connectToDatabase(); // Ensure the database is connected

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error("The email address is already in use. Please try logging in.");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationCode = crypto.randomBytes(4).toString("hex");
        const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry

        const user = new User({
            username: name,
            email,
            password: hashedPassword,
            phone,
            verif: false,
            verificationCode,
            verificationCodeExpires,
        });

        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Email Verification",
            text: `Your verification code is: ${verificationCode}`,
        };

        await transporter.sendMail(mailOptions);
        return "User registered successfully. Please check your email for the verification code.";
    } catch (err) {
        console.error("Error in registerFunModel:", err);
        throw err;
    }
};

// Login function
const loginFunModel = async (email, password) => {
    try {
        await connectToDatabase(); // Ensure the database is connected

        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid email address.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('The password entered is incorrect.');
        }

        return user._id;
    } catch (err) {
        console.error("Error in loginFunModel:", err);
        throw err;
    }
};

// Email verification function
const verifyEmail = async (email, code) => {
    try {
        await connectToDatabase(); // Ensure the database is connected

        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found.");
        }
        if (user.verif) {
            throw new Error("User is already verified.");
        }
        if (user.verificationCode !== code) {
            throw new Error("Invalid verification code.");
        }
        if (new Date() > user.verificationCodeExpires) {
            throw new Error("Verification code has expired.");
        }

        user.verif = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        return "Email verified successfully.";
    } catch (err) {
        console.error("Error in verifyEmail:", err);
        throw err;
    }
};

module.exports = {
    User,
    registerFunModel,
    loginFunModel,
    verifyEmail,
};
