const mongoose = require('mongoose');

const Order = mongoose.model('order', {
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true
  },
  dishes: [{
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dish",
      required: true
    },
    numberOfDish: {
      type: Number,
      required: true
    }
  }],
  deliveryMan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "DeliveryMan",
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
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