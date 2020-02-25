const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No user found with this id.'));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(new AppError('No document found with this id.'));
    }

    res.status(200).json({
      status: 'success',
      data: {
        message: '',
        data: doc
      }
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id ? req.params.id : req.user.id;
    let query = Model.findById(id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with this id.'));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // EXECUTE QUERY
    const feature = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await feature.query;

    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: doc
    });
  });
