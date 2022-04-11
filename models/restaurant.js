const mongoose = require('mongoose');

const Restaurant = mongoose.model('restaurants', {
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  cuisine: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  authToken: {
    type: String
  },
  active: {
    type: Boolean
  }
});

module.exports = Restaurant