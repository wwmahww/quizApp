const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'changing password is not allowed from this route. Please try /updateMyPassword',
        400
      )
    );

  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(
    { id: req.user.id },
    filteredBody,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    user: updatedUser
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!user.correctPassword(req.body.password, user.password))
    return next(
      new AppError('password is not correct. Please try again.', 401)
    );

  user.active = false;
  user.save({ validateBeforeSave: false });

  res.status(204).json({
    status: 'success'
  });
});

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.deleteUser = factory.deleteOne(User);
exports.updateUser = factory.updateOne(User);
