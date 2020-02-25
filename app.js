const express = require('express');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const userRouter = require('./routs/userRouter');
const viewRouter = require('./routs/viewRouter');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

const app = express();

// GLOBAL MIDDLEWARES

// Set security http headers
app.use(helmet());

// Development loggin
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// request limit
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'you reach your limit from this IP to requist to this route. Please try in a hour.'
});
app.use('/api', limiter);

// Body parser, reading data from body to req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitizing against noSQl qurey injection
app.use(mongoSanitize());

// Data sanitizing against xss
app.use(xss());

// Prevent parameter pullution
app.use(
  hpp({
    whitelist: ['']
  })
);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  next();
});

// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/users', userRouter);

// Takeing care of unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`can't find '${req.originalUrl}' on this server.`, 404));
});

// Global error handler
app.use(globalErrorHandler);

module.exports = app;
