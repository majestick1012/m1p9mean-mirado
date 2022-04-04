const res = require('express/lib/response');
const mongoose = require('mongoose');
const db = require('./config/db');
const path = require('path');

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

// Variables d'environnement
const mode = process.env.NODE_ENV || "Development";
const PORT = process.env.PORT || 3000;

// Routes
const clientRoutes = require("./routes/client");
const restaurantRoutes = require("./routes/restaurant");
const mailRoutes = require("./routes/mail");

// ExpressJS
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use("/api/client", clientRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/mail", mailRoutes);

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

app.listen(PORT, '0.0.0.0', function loadserver() {
  console.log('Mode: ' + mode);
  console.log(`Launching the app ${process.env.APP_NAME}`);
  console.log('Listening on port: ' + PORT);
  console.log('Connecting to ' + mode + ' database...');
});