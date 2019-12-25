const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.getAllUsers = async (req, res) => {
  try {
    // EXECUTE QUERY
    const feature = new APIFeatures(User.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const users = await feature.query;

    res.status(200).json({
      status: 'success',
      data: {
        message: '',
        result: users.length,
        users
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(200).json({
      status: 'success',
      data: {
        message: '',
        user: newUser
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateUser = async (req, res) => {
  console.log('request came!');
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        message: '',
        user
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};
