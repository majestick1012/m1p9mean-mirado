const express = require('express');
const Restaurant = require('../models/restaurant');
const Order = require('../models/order');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const guard = require('../middlewares/guard-restaurant');
const guardBase = require('../middlewares/guard-base');

const router = express.Router();

// GET ALL
router.get('/', guardBase, (req, res, next) => {
  Restaurant.find({}, '-username -password -authToken -__v').then(result => {
    if (result) {
      res.status(200).json({
        message: "Restaurants fetched successfully!",
        number: result.length,
        restaurants: result
      });
    } else {
      res.status(200).json({ message: "Aucun restaurant", number: 0, restaurants: [] });
    }
  })
});

// GET ONE
router.get('/getById/:id', guardBase, (req, res, next) => {
  Restaurant.findById(req.params.id, '-username -password -authToken').then(result => {
    if (result) {
      res.status(200).json({
        message: "Getting the restaurant successfully!",
        restaurant: result
      });
    } else {
      res.status(404).json({ message: "Restaurant not found" });
    }
  })
});

// SEARCH
router.get('/search/:criteria', guardBase, (req, res, next) => {
  const criteria = req.params.criteria;
  Restaurant.find({
    $or: [
      { name: { $regex: criteria, $options: 'i' } },
      { address: { $regex: criteria, $options: 'i' } },
      { cuisine: { $regex: criteria, $options: 'i' } }
    ],
  }, 'name address cuisine').then(result => {
    if (result) {
      res.status(200).json({
        message: "Restaurants fetched successfully!",
        number: result.length,
        restaurants: result
      });
    } else {
      res.status(200).json({ message: "Aucun restaurant", number: 0, restaurants: [] });
    }
  })
});

// GET ORDERS STATUS EN COURS
router.get('/getOrders/:id', guard, (req, res, next) => {
  Order.find({
    restaurant: {
      $in: mongoose.Types.ObjectId(req.params.id)
    },
    status: {
      $gt: 0, $lt: 50
    }
  }).populate('dishes.dish').then(result => {
    if (result) {
      res.status(200).json({
        message: "Orders fetched successfully",
        number: result.length,
        orders: result
      });
    } else {
      res.status(200).json({ message: "Aucune commande", number: 0, orders: [] });
    }
  });
});

// GET ALL ORDERS
router.get('/getAllOrders/:id', guard, (req, res, next) => {
  Order.find({
    restaurant: {
      $in: mongoose.Types.ObjectId(req.params.id)
    }
  }).populate('dishes.dish').then(result => {
    if (result) {
      res.status(200).json({
        message: "Orders fetched successfully",
        number: result.length,
        orders: result
      });
    } else {
      res.status(200).json({ message: "Aucune commande", number: 0, orders: [] });
    }
  });
});

// GET BENEF
router.get('/getProfit/:id', guard, (req, res, next) => {
  Order.find({
    restaurant: {
      $in: mongoose.Types.ObjectId(req.params.id)
    },
    status: 50
  }).then(result => {
    if (result) {
      let benef = 0;
      result.forEach(element => {
        benef += element.price;
      });
      res.status(200).json({
        message: "Orders fetched successfully",
        profit: benef,
      });
    } else {
      res.status(200).json({ message: "Aucun profit", profit: 0 });
    }
  });
});

// INSERT ONE
router.post('/', guard, (req, res, next) => {
  bcrypt.hash("newpassword", 10).then(hash => {
    let username = req.body.name.toLowerCase();
    username = username.replace(/[^A-Z0-9]/ig, "") + "-ekaly";
    const restaurant = new Restaurant({
      name: req.body.name,
      address: req.body.address,
      cuisine: req.body.cuisine,
      username: username,
      password: hash,
      authToken: null
    });
    restaurant.save().then(result => {
      if (result) {
        res.status(200).json({
          message: "Restaurant created successfully",
          restaurant: {
            _id: result._id,
            name: result.name,
            address: result.address,
            cuisine: result.cuisine,
          }
        });
      } else {
        res.status(500).json({ message: "Error creating restaurant " });
      }
    })
  });
});

// UPDATE ONE
router.put('/update/:id', guard, (req, res, next) => {
  let fetchedRestaurant;

  Restaurant.findById(req.params.id, '-password -authToken').then(restaurant => {
    if (restaurant) {
      fetchedRestaurant = restaurant;
      return true;
    } else {
      return false;
    }
  }).then(result => {
    if (!result) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    const restaurant = new Restaurant({
      name: req.body.name,
      address: req.body.address,
      cuisine: req.body.cuisine,
      username: req.body.username,
    });

    Restaurant.updateOne({ _id: fetchedRestaurant._id }, {
      $set: {
        name: restaurant.name,
        address: restaurant.address,
        cuisine: restaurant.cuisine,
        username: restaurant.username,
      }
    }).then(result => {
      if (result) {
        return res.status(200).json({ message: "Restaurant updated successfully" });
      } else {
        return res.status(500).json({ message: "Error updating restaurant" });
      }
    });
  }).catch(e => {
    console.log(e);
  });
});

// LOGIN RESTAURANT
router.post('/login', guardBase, (req, res, next) => {
  let fetchedRestaurant;

  Restaurant.findOne({ username: req.body.username }).then(restaurant => {
    if (!restaurant) {
      return res.status(401).json({
        message: "Auth failed! No such restaurant credential"
      });
    }

    fetchedRestaurant = restaurant;
    return bcrypt.compare(req.body.password, restaurant.password);
  }).then(result => {
    if (!result) {
      return res.status(401).json({
        message: "Auth failed! Incorrect password"
      });
    }

    // CREATING THE JSON WEBTOKEN WITH SIGNATURE AND KEY
    const token = jwt.sign(
      { username: fetchedRestaurant.username, userId: fetchedRestaurant._id },
      "secret_test_restaurant",
      { expiresIn: "1h" }
    );

    // SAVE TOKEN IN DB
    fetchedRestaurant.authToken = token;
    Restaurant.updateOne({ _id: fetchedRestaurant._id }, {
      $set: {
        authToken: token
      }
    }).then(result => {
      if (result) {
        res.status(200).json({
          expiresIn: 3600,
          restaurant: {
            _id: fetchedRestaurant._id,
            name: fetchedRestaurant.name,
            address: fetchedRestaurant.address,
            cuisine: fetchedRestaurant.cuisine,
            authToken: fetchedRestaurant.authToken
          }
        });
      } else {
        res.status(401).json({
          message: "Auth failed!"
        });
      }
    });
  }).catch(e => {
    console.log(e);
  })
});

// LOGOUT RESTAURANT
router.post('/logout', guard, (req, res, next) => {
  Restaurant.updateOne({ _id: req.body.id }, {
    $set: {
      authToken: null,
    }
  }).then(result => {
    if (result) {
      res.status(200).json({ message: "Logout successful!" });
    } else {
      res.status(500).json({ message: "Error logout restaurant" });
    }
  }).catch(e => {
    console.log(e);
  })
});

// DELETE ONE
module.exports = router