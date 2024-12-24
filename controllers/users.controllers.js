const authModel = require('../models/users.models');

exports.getRegisterPage = (req, res) => {
    res.render('register');
};

exports.getLoginPage = (req, res) => {
    res.render('login');
};

exports.getVerifPage = (req, res) => {
    res.render('verif');
};

exports.getHome = (req, res) => {
    res.render('home');
};

exports.postRegisterPage = (req, res) => {
    if (!req.body.username || !req.body.email || !req.body.password || !req.body.phone) {
        console.log('All fields are required');
        return res.redirect('/register'); // Redirect back to the register page
    }

    if (req.body.password !== req.body.cpassword) {
        console.log('Passwords must match');
        return res.redirect('/register');
    } else {
        authModel.registerFunModel(req.body.username, req.body.email, req.body.password, req.body.phone)
            .then(() => {
                console.log('Registration successful. Verification email sent.');
                res.redirect('/verif'); // Redirect to the verification page on successful registration
            })
            .catch((err) => {
                console.error('Registration error:', err);
                res.redirect('/register'); // Redirect back to the register page
            });
    }
};

exports.postVerifPage = (req, res) => {
    if (!req.body.email || !req.body.code) {
        console.log('Email and verification code are required');
        return res.redirect('/verif'); // Redirect back to the verification page
    }

    authModel.verifyEmail(req.body.email, req.body.code)
        .then(() => {
            console.log('Verification successful. You can now log in.');
            res.redirect('/login'); // Redirect to the login page on successful verification
        })
        .catch((err) => {
            console.error('Verification error:', err);
            res.redirect('/verif'); // Redirect back to the verification page
        });
};

exports.postLoginPage = (req, res) => {
    if (!req.body.email || !req.body.password) {
        console.log('All fields are required');
        return res.redirect('/login'); // Redirect back to the login page
    }

    authModel.loginFunModel(req.body.email, req.body.password)
        .then((id) => {
            if (!req.session) {
                return res.status(500).send('Session is not initialized.');
            }
            req.session.userId = id;
            console.log(req.body,'reqqq')
            console.log('Login successful');
            res.redirect('/home');
             
        })
        .catch((err) => {
            console.error('Login error:', err);
            res.redirect('/login'); // Redirect back to the login page
        });
};


