const mongoose = require('mongoose');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'A user must have a name.'],
    trim: true,
    minlength: [3, 'name must have more or equal than 3 characters.'],
    maxlength: [40, 'name must have less or equal than 40 characters.']
  },
  password: {
    type: Number,
    required: [true, 'A user must have a password.'],
    min: [8, 'password must contains at least 8 characters.'],
    max: [30, 'password must contains at most 30 characters.'],
    select: false
  },
  email: {
    type: String,
    required: [true, 'A user must have an email.'],
    unique: true,
    trim: true,
    validate: [validator.isEmail, 'email is not valid.please try again.']
  },
  role: {
    type: String,
    default: 'user',
    enum: {
      values: ['user', 'admin'],
      message: 'role can be user or admin.'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

// Query middleware
UserSchema.pre(/^find/, function(next) {
  this.find({ role: 'user' });
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
