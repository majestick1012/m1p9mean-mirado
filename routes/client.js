const express = require('express');
const Client = require('../models/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// SIGNUP ROUTE
router.post('/signup', (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then(hash => {
    const client = new Client({
      username: req.body.email,
      email: req.body.email,
      password: hash,
      firstName: null,
      lastName: null,
      bio: null,
      imagePath: null,
      authToken: null
    });

    Client.findOne({ email: req.body.email }).then(user1 => {
      if (user1) {
        return res.status(401).json({
          message: "User Already Exist"
        });
      }

      client.save().then(result => {
        if (!result) {
          return res.status(500).json({
            message: "Error Creating User"
          });
        }

        res.status(201).json({
          message: "User created",
          result: result
        });
      })
    })
      .catch(err => {
        console.log(err);
        res.status(500).json({
          error: err
        });
      });
  })
})

// SIGNIN ROUTE
router.post('/login', (req, res, next) => {
  let fetchedClient;

  Client.findOne({ email: req.body.email }).then(user => {
    if (!user) {
      return res.status(401).json({
        message: "Auth failed! No such user"
      });
    }

    fetchedClient = user;
    return bcrypt.compare(req.body.password, user.password);
  }).then(result => {
    if (!result) {
      return res.status(401).json({
        message: "Auth failed! Incorrect password"
      });
    }

    // CREATING THE JSON WEBTOKEN WITH SIGNATURE AND KEY
    const token = jwt.sign(
      { email: fetchedClient.email, userId: fetchedClient._id },
      "secret_test_pour_le_moment",
      { expiresIn: "1h" }
    );

    // SAVE TOKEN IN DB
    fetchedClient.authToken = token;
    Client.updateOne({ _id: fetchedClient._id }, {
      $set: {
        authToken: token
      }
    }).then(result => {
      if (result) {
        res.status(200).json({
          expiresIn: 3600,
          client: {
            _id: fetchedClient._id,
            username: fetchedClient.username,
            email: fetchedClient.email,
            firstName: fetchedClient.firstName,
            lastName: fetchedClient.lastName,
            bio: fetchedClient.bio,
            imagePath: fetchedClient.imagePath,
            authToken: fetchedClient.authToken
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
})

// UPDATE CLIENT
router.put('/:id', (req, res, next) => {
  const client = new Client({
    username: req.body.username,
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    bio: req.body.bio,
    imagePath: req.body.imagePath,
  });

  Client.updateOne({ _id: req.params.id }, {
    $set: {
      username: client.username,
      email: client.email,
      firstName: client.firstName,
      lastName: client.lastName,
      bio: client.bio,
      imagePath: client.imagePath,
    }
  }).then(result => {
    if (result) {
      res.status(200).json({ message: "Update successful!", client: client });
    } else {
      res.status(500).json({ message: "Error updating user" });
    }
  }).catch(e => {
    console.log(e);
  })
})

// LOGOUT
router.post('/logout', (req, res, next) => {
  Client.updateOne({ _id: req.body.id }, {
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
  })
});

module.exports = router