const mongoose = require('mongoose');

const Order = mongoose.model('orders', {
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "clients",
    required: true
  },
  dishes: [{
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "dishes",
      required: true
    },
    numberOfDish: {
      type: Number,
      required: true
    }
  }],
  deliveryMan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "deliverymans",
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "restaurants",
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: Number,
    required: true
  },
  deliveryDate: {
    type: Date,
  },
  active: {
    type: Boolean
  }
});

module.exports = Order