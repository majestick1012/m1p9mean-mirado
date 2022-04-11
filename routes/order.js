const express = require('express');
const Order = require('../models/order');
const Dish = require('../models/dish');
const Client = require('../models/client');
const Restaurant = require('../models/restaurant');
const guard = require('../middlewares/check-auth');
const { default: mongoose } = require('mongoose');

const router = express.Router();

// ADD AN ORDER
router.post('/sendOrder', guard, (req, res, next) => {
  Restaurant.findById(req.body.restaurant, '-username -password -authToken').then(resto => {
    if (resto) {
      const token = req.headers.authorization.split(" ")[1];
      const decodedToken = jwt.verify(token, "secret_test_pour_le_moment");

      const ids = req.body.dishes.map((d) => d.dish).map(mongoose.Types.ObjectId);
      Dish.find(
        {
          _id: {
            $in: ids
          }
        }).then(dishes => {
          if (dishes) {
            const tables = req.body.dishes.map(obj => {
              var rObj = {};
              rObj["dish"] = mongoose.Types.ObjectId(obj.dish);
              rObj["numberOfDish"] = obj.numberOfDish;
              return rObj;
            });
            let totalPrice = 0;
            tables.forEach(element => {
              totalPrice += element.numberOfDish * dishes.find(d => d._id.equals(element.dish)).price;
            });

            const order = new Order({
              client: mongoose.Types.ObjectId(decodedToken.userId),
              dishes: tables,
              deliveryMan: null,
              restaurant: resto,
              price: totalPrice,
              status: 10,
              deliveryDate: null,
              active: true,
            });

            order.save().then(result => {
              if (result) {
                res.status(200).json({
                  message: "Order sent successfully",
                  totalPrice: order.price
                });
              } else {
                res.status(500).json({ message: "Error sending order " });
              }
            })
          } else {
            res.status(404).json({ message: "Dishes not found" });
          }
        })
    } else {
      res.status(404).json({ message: "Restaurant not found" });
    }
  })
});

module.exports = router