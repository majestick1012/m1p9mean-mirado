const express = require('express');
var nodemailer = require('nodemailer');
const router = express.Router();
const guardBase = require('../middlewares/guard-base');

// CONFIGURATION MAIL
const mailUsername = process.env.MAIL_USERNAME;
const mailPassword = process.env.MAIL_PASSWORD;
const clientId = process.env.OAUTH_CLIENTID;
const clientSecret = process.env.OAUTH_CLIENT_SECRET;
const refreshToken = process.env.OAUTH_REFRESH_TOKEN;

// SEND MAIL TEST
router.post('/subscribe', guardBase, function (req, res) {
  // OAuth
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: mailUsername,
      pass: mailPassword,
      clientId: clientId,
      clientSecret: clientSecret,
      refreshToken: refreshToken
    }
  });
  let mailOptions = {
    from: mailUsername,
    to: req.body.email,
    subject: '[M1P9MEAN-MIRADO] Subscribing from Project MEAN',
    text: 'Hi from your nodemailer project.'
  };
  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error sending mail" });
    } 
    return res.status(200).json({ message: "Email sent successfully" });
  });
});

module.exports = router