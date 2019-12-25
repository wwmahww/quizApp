const path = require('path');
const express = require('express');
const morgan = require('morgan');
const userRouter = require('./routs/userRouter');

const app = express();

// MIDDLEWARES
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json());

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

//  ROUTE HANDLERS
const getIntro = (req, res) => {
  res.status(200).render('intro', {
    title: 'quizApp'
  });
};

// ROUTES
app.route('/').get(getIntro);
app.use('/api/v1/users', userRouter);

module.exports = app;
