const mongoose = require('mongoose');

const Client = mongoose.model('clients', {
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  bio: {
    type: String
  },
  imagePath: {
    type: String
  },
  authToken: {
    type: String
  },
  active: {
    type: Boolean
  }
});

module.exports = Client