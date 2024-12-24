const User = require('../models/users.models');

exports.requireVerification = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.redirect('/login'); 
    }

    console.log('Debug: User model', User); 
    console.log('Session userId:', req.session.userId);

    User.findOne({ _id: req.session.userId })
        .then((user) => {
            if (!user) {
                req.session.destroy(); 
                return res.redirect('/login');
            }

            if (!user.verif) {
                console.log('User is not verified.');
                return res.redirect('/verif'); 
            }

            next();
        })
        .catch((err) => {
            console.error('Error during verification check:', err);
            res.redirect('/login'); 
        });
};
