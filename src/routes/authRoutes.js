const express = require('express');
const AuthController = require('../controllers/authController');
const router = express.Router();
const authController = new AuthController();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.get('/logout', authController.logout.bind(authController));
router.post('/change-password', authController.changePassword.bind(authController));

module.exports = router;