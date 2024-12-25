const mongoose = require('mongoose');
const { User } = require('../models/users.models'); // Ensure this path and export are correct
const url = process.env.url;

// Establish and reuse a single database connection
const connectToDatabase = async () => {
    if (mongoose.connection.readyState === 0) { // Check if not already connected
        try {
            await mongoose.connect(url);
            console.log('Connected to MongoDB successfully.');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
            process.exit(1); // Exit process if connection fails
        }
    }
};

// Ensure the database is connected during application startup
(async () => {
    await connectToDatabase();
})();

// Function to check if a user is verified
exports.requireVerification = async (id) => {
    try {
        await connectToDatabase(); // Ensure the database is connected before querying
        console.log("Using User model:", User); // Debugging check

        // Check if the user exists
        const user = await User.findById(id);
        if (!user) {
            throw new Error('User not found');
        }

        // Check if the user is verified
        if (!user.verif) {
            throw new Error('User is not verified');
        }

        return user;
    } catch (err) {
        console.error('Error in requireVerification:', err);
        throw err; // Propagate the error for further handling
    }
};

// Middleware to check if the user is logged in
exports.islogged = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    return res.status(401).json({ error: 'User must log in.' });
};
