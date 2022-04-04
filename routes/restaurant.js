const express = require('express');
const Restaurant = require('../models/restaurant');
const bcrypt = require('bcrypt');
const { json } = require('body-parser');

const router = express.Router();

// GET ALL
router.get('/', (req, res, next) => {
  Restaurant.find({}, '-username -password -authToken').then(result => {
    if (result) {
      res.status(200).json({
        message: result.length + " Restaurants fetched successfully!",
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
router.post('/', (req, res, next) => {
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
router.put('/:id', (req, res, next) => {
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
})
// DELETE ONE
module.exports = router