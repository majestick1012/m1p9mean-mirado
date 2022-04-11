const express = require('express');
const Admin = require('../models/admin');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const guard = require('../middlewares/guard-admin');
const guardBase = require('../middlewares/guard-base');

const router = express.Router();

// LOGIN
router.post('/login', guardBase, (req, res, next) => {
  let fetchedAdmin;

  Admin.findOne({ username: req.body.username }).then(user => {
    if(!user) {
      return res.status(401).json({
        message: "Auth failed! No such user"
      });
    }

    fetchedAdmin = user;
    return bcrypt.compare(req.body.password, user.password);
  }).then(result => {
    if(!result) {
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
      if(result) {
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