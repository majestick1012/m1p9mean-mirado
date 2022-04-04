const mongoose = require('mongoose');

const Dish = mongoose.model('dishes', {
  name: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  imagePath: {
    type: String
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true
  },
  visibility: {
    type: Boolean,
    required: true
  }
});

module.exports = Dish