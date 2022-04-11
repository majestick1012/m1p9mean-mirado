const express = require('express');
const Admin = require('../models/admin');
const Order = require('../models/order');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const guard = require('../middlewares/guard-admin');
const guardBase = require('../middlewares/guard-base');

const router = express.Router();

// GET ALL ORDERS
router.get('/getAllOrders', guard, (req, res, next) => {
  Order.find({}).then(result => {
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
router.get('/getAllProfit', guard, (req, res, next) => {
  Order.find({ status: 50 }).then(result => {
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

// GET ALL ORDERS
router.get('/getAllProfitByRestaurant/:id', guard, (req, res, next) => {
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

// GET ALL ORDERS
router.get('/getAllProfitByDay', guard, (req, res, next) => {
  const currentDate = new Date();
  const dateDebut = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  Order.find({
    status: 50,
    deliveryDate: {
      $gte: dateDebut,
      $lte: dateDebut.setDate(currentDate.getDate() + 1)
    }
  }).then(result => {
    if (result) {
      let benef = 0;
      result.forEach(element => {
        benef += element.price;
      });
      res.status(200).json({
        message: "Profit fetched successfully",
        profit: benef,
      });
    } else {
      res.status(200).json({ message: "Aucun profit", profit: 0 });
    }
  });
});

// LOGIN
router.post('/login', guardBase, (req, res, next) => {
  let fetchedAdmin;

  Admin.findOne({ username: req.body.username }).then(user => {
    if (!user) {
      return res.status(401).json({
        message: "Auth failed! No such user"
      });
    }

    fetchedAdmin = user;
    return bcrypt.compare(req.body.password, user.password);
  }).then(result => {
    if (!result) {
      return res.status(401).json({
        message: "Auth failed! Incorrect password"
      });
    }

    // CREATING THE JSON WEBTOKEN WITH SIGNATURE AND KEY
    const token = jwt.sign(
      { username: fetchedAdmin.username, userId: fetchedAdmin._id },
      "secret_test_admin",
      { expiresIn: "8h" }
    );

    // SAVE TOKEN IN DB
    fetchedAdmin.authToken = token;
    Admin.updateOne({ _id: fetchedAdmin._id }, {
      $set: {
        authToken: token
      }
    }).then(result => {
      if (result) {
        res.status(200).json({
          expiresIn: 28800,
          admin: {
            _id: fetchedAdmin._id,
            username: fetchedAdmin.username,
            imagePath: fetchedAdmin.imagePath,
            authToken: fetchedAdmin.authToken,
            active: fetchedAdmin.active
          }
        })
      } else {
        res.status(401).json({
          message: "Auth failed!"
        });
      }
    });
  }).catch(e => {
    console.log(e);
  });
});

// LOGOUT
router.post('/logout', guard, (req, res, next) => {
  Admin.updateOne({ _id: req.body.id }, {
    $set: {
      authToken: null,
    }
  }).then(result => {
    if (result) {
      res.status(200).json({ message: "Logout successful!" });
    } else {
      res.status(500).json({ message: "Error logout user" });
    }
  }).catch(e => {
    console.log(e);
  });
});

module.exports = router