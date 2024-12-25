const express = require('express');
const guard=require("./guard.auth")
const router = express.Router();
const authModel = require('../models/users.models');


    
router.post('/register', (req, res) => {
    if (!req.body.username || !req.body.email || !req.body.password || !req.body.phone) {
        return res.json({error:'All fields are required'});
    }

    if (req.body.password !== req.body.cpassword) {
        return res.json({error:'Passwords must match'});
    } else {
        authModel.registerFunModel(req.body.username, req.body.email, req.body.password, req.body.phone)
            .then(() => {
                return res.json({error:'Registration successful. Verification email sent.'});
            })
            .catch((err) => {
                return res.json({error:'Registration error: ',err});
            });
        }
        });
router.post('/verif',(req, res) => {
    if (!req.body.email || !req.body.code) {
        return res.json({error:'Email and verification code are required'});
    }

    authModel.verifyEmail(req.body.email, req.body.code)
        .then(() => {
            return ({error:'Verification successful. You can now log in.'});
        })

        .catch((err) => {
            return res.json({error:'Verification error:', err});
        })
    }
    );





router.get('/home', guard.islogged, (req, res) => {
        res.json({ message: 'You are logged in, welcome home!' });
    });
    
router.get('/', (req, res) => {
        res.status(200).send('Welcome to the VerifLogin API. Use the appropriate endpoints.');
    });

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Attempt to login user
        const userId = await authModel.loginFunModel(email, password);

        if (!req.session) {
            return res.status(500).json({ error: 'Session is not initialized.' });
        }

        console.log("Logged in user ID:", userId);

        // Check if user is verified
        try {
            const user = await guard.requireVerification(userId);

            // Save user info in the session
            req.session.user = user;

            return res.status(200).json({ message: 'Login successful', user });
        } catch (verificationError) {
            return res.status(403).json({ error: 'Please verify your email first.' });
        }
    } catch (loginError) {
        console.error('Login error:', loginError);
        return res.status(401).json({ error: 'Invalid email or password.' });
    }
});

module.exports = router;
