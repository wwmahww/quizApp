const nodemailer = require('nodemailer');

const sendEmail = oprions => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
    // Activate in gmail "less secure app" option
  });
  // 2) Define the email options
  const mailOpions = {
    from: 'amir <amirtnt80@yahoo.com',
    to: oprions.email,
    subject: oprions.subject,
    text: oprions.message
  };

  // 3) Actually send the email
  transporter.sendMail(mailOpions);
};

module.exports = sendEmail;
