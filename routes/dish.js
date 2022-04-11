const express = require('express');
const Dish = require('../models/dish');
const Restaurant = require('../models/restaurant');
const guardBase = require('../middlewares/guard-base');
const guard = require('../middlewares/guard-restaurant');
const { json } = require('body-parser');

const router = express.Router();

// GET ALL
router.get('/', guardBase, (req, res, next) => {
  Dish.find({}, '-__v').then(result => {
    if (result) {
      res.status(200).json({
        message: "Dishes fetched successfully!",
        number: result.length,
        dishes: result
      });
    } else {
      res.status(200).json({ message: "Aucun plat", dishes: [] });
    }
  })
});

// GET ONE
router.get('/:id', guardBase, (req, res, next) => {
  Dish.findById(req.params.id, '-__v').then(result => {
    if (result) {
      res.status(200).json({
        message: "Getting the dish successfully!",
        dish: result
      });
    } else {
      res.status(404).json({ message: "Dish not found" });
    }
  })
});

// INSERT ONE
router.post('/', guard, (req, res, next) => {
  Restaurant.findById(req.body.restaurant, '-username -password -authToken').then(result => {
    if (result) {
      const dish = new Dish({
        name: req.body.name,
        price: req.body.price,
        imagePath: req.body.imagePath,
        restaurant: result,
        visibility: req.body.visibility,
        active: true,
      });
      dish.save().then(result => {
        if (result) {
          res.status(200).json({
            message: "Dish created successfully",
            dish: {
              _id: result._id,
              name: result.name,
              price: result.price,
              imagePath: result.imagePath,
              restaurant: result.restaurant,
              visibility: result.visibility,
              active: result.active
            }
          });
        } else {
          res.status(500).json({ message: "Error creating dish" });
        }
      })
    } else {
      res.status(404).json({ message: "Restaurant not found" });
    }
  })
});

// UPDATE ONE
router.put('/:id', guard, (req, res, next) => {
  let fetchedDish;

  Dish.findById(req.params.id).then(dish => {
    if (dish) {
      fetchedDish = dish;
      return true;
    } else {
      return false;
    }
  }).then(result => {
    if (!result) {
      return res.status(404).json({ message: "Dish not found " });
    }

    const dish = new Dish({
      name: req.body.name,
      price: req.body.price,
      imagePath: req.body.imagePath,
      visibility: req.body.visibility,
      active: true,
    });

    Dish.updateOne({ _id: fetchedDish._id }, {
      $set: {
        name: dish.name,
        price: dish.price,
        imagePath: dish.imagePath,
        visibility: dish.visibility,
        active: dish.active,
      }
    }).then(result => {
      if (result) {
        return res.status(200).json({ message: "Dish updated successfully" });
      } else {
        return res.status(500).json({ message: "Error updating dish" });
      }
    });
  }).catch(e => {
    console.log(e);
  });
});

module.exports = router