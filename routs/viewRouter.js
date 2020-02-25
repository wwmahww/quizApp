const express = require('express');
const viewController = require('./../controller/viewController');
const authController = require('./../controller/authController');

const router = express.Router();

router.get('/me', authController.protect, viewController.myProfile);

router.use(authController.isLoggedIn);

router.get('/', viewController.getIntroduction);
router.get('/signin', viewController.signIn);
router.get('/signup', viewController.signUp);

module.exports = router;
