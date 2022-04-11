const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, "secret_test_admin");
    req.userData = {
      username: decodedToken.username,
      userId: decodedToken.userId
    };
    next();
  } catch (error) {
    res.status(403).json({ message: "Forbidden!" });
  }
}