const express = require('express');
const userController = require('./../controller/userController');

const Router = express.Router();

Router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

Router.route('/:id').patch(userController.updateUser);

module.exports = Router;
