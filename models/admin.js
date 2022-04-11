const mongoose = require('mongoose');

const Admin = mongoose.model('admin', {
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
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

module.exports = Admin