const express = require('express');
const DeliveryMan = require('../models/deliveryMan');
const Order = require('../models/order');
const Dish = require('../models/dish');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const guard = require('../middlewares/guard-deliveryman');
const guardBase = require('../middlewares/guard-base');
const { default: mongoose } = require('mongoose');

const router = express.Router();

// LOGIN
router.post('/login', guardBase, (req, res, next) => {
  let fetchedDeliveryMan;

  DeliveryMan.findOne({ username: req.body.username }).then(user => {
    if (!user) {
      return res.status(401).json({
        message: "Auth failed! No such user"
      });
    }

    fetchedDeliveryMan = user;
    return bcrypt.compare(req.body.password, user.password);
  }).then(result => {
    if (!result) {
      return res.status(401).json({
        message: "Auth failed! Incorrect password"
      });
    }

    // CREATING THE JSON WEBTOKEN WITH SIGNATURE AND KEY
    const token = jwt.sign(
      { username: fetchedDeliveryMan.username, userId: fetchedDeliveryMan._id },
      "secret_test_deliveryman",
      { expiresIn: "8h" }
    );

    // SAVE TOKEN IN DB
    fetchedDeliveryMan.authToken = token;
    DeliveryMan.updateOne({ _id: fetchedDeliveryMan._id }, {
      $set: {
        authToken: token
      }
    }).then(result => {
      if (result) {
        res.status(200).json({
          expiresIn: 28800,
          deliveryMan: {
            _id: fetchedDeliveryMan._id,
            username: fetchedDeliveryMan.username,
            imagePath: fetchedDeliveryMan.imagePath,
            authToken: fetchedDeliveryMan.authToken
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
  });
});

// LOGOUT
router.post('/logout', guard, (req, res, next) => {
  DeliveryMan.updateOne({ _id: req.body.id }, {
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

// GET ORDERS STATUS EN COURS
router.get('/getOrders', guard, (req, res, next) => {
  Order.find({
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

// GET ORDERS PRIS EN CHARGE
router.get('/getOrdersTaken', guard, (req, res, next) => {
  Order.find({
    status: 20
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


// TAKE ORDER
router.put('/takeOrder', guard, (req, res, next) => {
  let fetchedOrder;

  Order.findById(req.body.order).then(order => {
    if (order) {
      fetchedOrder = order;
      return true;
    } else {
      return false;
    }
  }).then(result => {
    if (!result) {
      return res.status(404).json({ message: "Order not found" });
    }
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "secret_test_deliveryman");

    const order = new Order({
      status: 20,
      deliveryMan: mongoose.Types.ObjectId(decodedToken.userId)
    });

    Order.updateOne({ _id: fetchedOrder._id }, {
      $set: {
        status: order.status,
        deliveryMan: order.deliveryMan
      }
    }).then(result => {
      if (result) {
        return res.status(200).json({ message: "Vous avez pris en charge la commande." });
      } else {
        return res.status(500).json({ message: "Error taking order" });
      }
    });
  }).catch(e => {
    console.log(e);
  });
});

// END WORKFLOW ORDER
router.put('/successDelivery', guard, (req, res, next) => {
  let fetchedOrder;

  Order.findById(req.body.order).then(order => {
    if (order && order.deliveryMan != null) {
      fetchedOrder = order;
      return true;
    } else {
      return false;
    }
  }).then(result => {
    if (!result) {
      return res.status(404).json({ message: "Commande introuvable ou non pris en charge" });
    }

    const order = new Order({
      status: 50,
      deliveryDate: Date.now()
    });

    Order.updateOne({ _id: fetchedOrder._id }, {
      $set: {
        status: order.status,
        deliveryDate: order.deliveryDate
      }
    }).then(result => {
      if (result) {
        return res.status(200).json({ message: "La commande a été délivré." });
      } else {
        return res.status(500).json({ message: "Error taking order" });
      }
    });
  }).catch(e => {
    console.log(e);
  });
});

module.exports = router