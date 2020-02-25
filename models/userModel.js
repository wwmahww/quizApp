const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const catchAsync = require('./../utils/catchAsync');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, 'A user must have a name.'],
    trim: true,
    minlength: [3, 'name must have more or equal than 3 characters.'],
    maxlength: [40, 'name must have less or equal than 40 characters.']
  },
  password: {
    type: String,
    required: [true, 'A user must have a password.'],
    minlength: [8, 'password must contains at least 8 characters.'],
    maxlength: [30, 'password must contains at most 30 characters.'],
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password.'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwrod and confirm are not the same'
    }
  },
  email: {
    type: String,
    required: [true, 'A user must have an email.'],
    unique: true,
    lowercase: true,
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
  },
  passwordChangeAt: Date,
  passwordResetToken: String,
  passwordResetExpired: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.passwordChangeAt = Date.now() - 1000;
  next();
});

UserSchema.methods.correctPassword = async function(
  condidatePassword,
  userPassword
) {
  return await bcrypt.compare(condidatePassword, userPassword);
};

UserSchema.methods.changesPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangeAt) {
    const changedtimestamp = parseInt(
      this.passwordChangeAt.getTime() / 1000,
      10
    );
    console.log(changedtimestamp, JWTTimestamp);
    return JWTTimestamp < changedtimestamp;
  }

  return false;
};

UserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpired = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Query middleware
UserSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
