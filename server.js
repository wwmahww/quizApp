const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('unhandled rejection! 💥 shutting down...');
  process.exit(1);
});

const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('database connect successfuly'));

//  START SERVER
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`app is running on port ${port}`);
});

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('unhandled rejection! 💥 shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
