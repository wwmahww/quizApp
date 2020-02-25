const AppError = require('./../utils/appError');

const handleCastErrirDB = err => {
  const message = `invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 404);
};

const handleDuplicateFeildDB = err => {
  const value = err.errmsg.match(/(["'])(?:\\.|[^\\])*?\1/)[0];
  const message = `Duplicate feild value:${value}. please use another value!`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! please log in again.', 401);

// Send error in development
const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      err,
      message: err.message,
      stack: err.stack
    });
  }
  console.error('Error💥', err);
  // B) RENDERED WEBSITE
  res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: err.message
  });
};

// Send error in production
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // 1) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    // 2) programming or other unknown error
    return res.status(500).json({
      status: 'error',
      message: 'something went very wrong!'
    });
  }
  // B) RENDERED WEBSITE
  // 1) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'something went wrong',
      msg: err.message
    });
  }
  // 2) programming or other unknown error
  return res.status(err.statusCode).render('error', {
    title: 'something went wrong',
    msg: 'please try again later.'
  });
};

// Main -------------------

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (error.name === 'castError') error = handleCastErrirDB(error);
    if (error.code === 11000) error = handleDuplicateFeildDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);

    sendErrorProd(error, req, res);
  }
};
