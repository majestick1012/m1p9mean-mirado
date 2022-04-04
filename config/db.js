const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const url = process.env.CONNECTION_STRING;

let mong = mongoose.connect(url, { useUnifiedTopology: true }, (err) => {
  if(!err){
    console.log('MongoDB Connection Succeeded.');
  } else {
    console.log('Error in DB connection: ' + err);
  }
});