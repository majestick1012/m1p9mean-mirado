const express = require('express');
const Restaurant = require('../models/restaurant');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const guard = require('../middlewares/guard-restaurant');

const router = express.Router();

// GET ALL
router.get('/', (req, res, next) => {
  Restaurant.find({}, '-username -password -authToken -__v').then(result => {
    if (result) {
      res.status(200).json({
        message: "Restaurants fetched successfully!",
        number: result.length,
        restaurants: result
      });
    } else {
      res.status(200).json({ message: "Aucun restaurant", restaurants: [] });
    }
  })
});

// GET ONE
router.get('/:id', (req, res, next) => {
  Restaurant.findById(req.params.id, '-username -password -authToken').then(result => {
    if (result) {
      res.status(200).json({
        message: "Getting the restaurant successful!",
        restaurant: result
      });
    } else {
      res.status(404).json({ message: "Restaurant not found" });
    }
  })
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
        })
      } else {
        res.status(500).json({ message: "Error creating restaurant " });
      }
    })
  });
});

// UPDATE ONE
router.put('/:id', guard, (req, res, next) => {
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
router.post('/login', (req, res, next) => {
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
router.post('/logout', (req, res, next) => {
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