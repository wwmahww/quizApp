const express = require('express');
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');

const Router = express.Router();

Router.post('/signup', authController.signup);
Router.post('/login', authController.login);
Router.get('/logout', authController.logout);
Router.post('/forgetPassword', authController.forgetPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this point
Router.use(authController.protect);

Router.patch('/updateMyPassword', authController.updatePassword);

Router.patch('/updateMe', userController.updateMe);
Router.delete('/deleteMe', userController.deleteMe);
Router.get('/me', userController.getUser);

// Ristrict all routes after this point
Router.use(authController.restrictTo('admin'));

Router.route('/').get(userController.getAllUsers);

Router.route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = Router;
