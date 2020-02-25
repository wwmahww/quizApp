const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const sendEmail = require('./../utils/email');

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.logout = (req, res, next) => {
  res.cookie('jwt', 'logged out', {
    expires: new Date(Date.now() + 10 + 1000),
    httpOnly: true
  });
  console.log(req.originalUrl);
  res.status(200).json({ status: 'success' });
};

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if the email and password is exist.
  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  // 2) check if the password is correct.
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything is ok send token to client.
  createSendToken(user, 200, res);
});

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
  });

  createSendToken(newUser, 201, res);
});

exports.isLoggedIn = async (req, res, next) => {
  // 1) Getting token and check if its there
  if (req.cookies.jwt) {
    try {
      // 2) Verification token
      const decode = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 3) Check if user still exist
      const freshUser = await User.findById(decode.id);
      if (!freshUser) return next();

      // 4) Check if user change password after token was issued
      if (freshUser.changesPasswordAfter(decode.iat)) return next();

      // There is a logged in user
      res.locals.user = freshUser;
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('you are not logged in.Please log in to get access.', 401)
    );
  }

  // 2) Verification token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exist
  const freshUser = await User.findById(decode.id);
  if (!freshUser)
    return next(
      new AppError('The user blongin to this user no longer exist.', 401)
    );

  // 4) Check if user change password after token was issued
  if (freshUser.changesPasswordAfter(decode.iat))
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ->  ['admin',....]

    if (!roles.includes(req.user.role))
      return next(
        new AppError('you do not have permission to perform this action.', 403)
      );

    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  // 1) Recive user email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with this email.', 404));
  // 2) Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3) Send it to the user email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forget your password? Submit a patch request with your new password and confirmPassword to: ${resetURL}.\n If you didn't please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token (valid for 10 minute)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token send to email!',
      token: resetToken
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) get user base on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpired: { $gt: Date.now() }
  });
  // 2) If the token has not expired, and the user exist, set the password
  if (!user) return next(new AppError('Token is invalid or expired.', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpired = undefined;

  await user.save();
  // 3) Update changePasswordAt property for the user

  // 4) Log the user in, send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById({ id: req.user.id }).select('+password');

  // 2) Check if POSTed current password is correct
  if (!user.correctPassword(req.body.passwordCurrent, user.password))
    return next(
      new AppError('password is not correct. Please try again.', 401)
    );

  // 3) If so update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) Log the user in and send JWT
  createSendToken(user, 200, res);
});
