const res = require('express/lib/response');
const mongoose = require('mongoose');
const db = require('./config/db');

var express = require('express');
var nodemailer = require('nodemailer');
const path = require('path');
var app = express();
var bodyParser = require('body-parser');

// Variables d'environnement
var mode = process.env.NODE_ENV || "Development";
var port = process.env.PORT || 3000;

// Routes
const clientRoutes = require("./routes/client");
const restaurantRoutes = require("./routes/restaurant");

// ExpressJS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use("/api/client", clientRoutes);
app.use("/api/restaurant", restaurantRoutes);

app.get('/', function (request, response) {
  console.log('Bienvenue');
  response.sendFile(path.join(__dirname + '/public/index.html'));
});

app.get('/api/gmail', function (request, response) {
  // OAuth
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.MAIL_USERNAME,
      pass: process.env.MAIL_PASSWORD,
      clientId: process.env.OAUTH_CLIENTID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
  });
  let mailOptions = {
    from: process.env.MAIL_USERNAME,
    to: 'majestick1012@gmail.com',
    subject: '[TEST] Nodemailer Project MEAN',
    text: 'Hi from your nodemailer project.'
  };
  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log("Error " + err);
    } else {
      console.log("Email test sent successfully");
    }
    response.redirect('/');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', function loadserver() {
  console.log('Mode: ' + mode);
  console.log(`Launching the app ${process.env.APP_NAME}`);
  console.log('Listening on port: ' + PORT);
  console.log('Connecting to ' + mode + ' database...');
});