const express = require('express');
const authController = require('../controllers/users.controllers');
const guard=require("./guard.auth")
const router = express.Router();


router.get('/register', authController.getRegisterPage);
router.post('/register', authController.postRegisterPage);

router.get('/login',authController.getLoginPage);
router.post('/login', authController.postLoginPage);

router.get('/verif',authController.getVerifPage);
router.post('/verif', authController.postVerifPage);

router.get('/home',guard.requireVerification,authController.getHome);

module.exports = router;
