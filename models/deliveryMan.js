const mongoose = require('mongoose');

const DeliveryMan = mongoose.model('deliverymans', {
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

module.exports = DeliveryMan