const jwt = require("jsonwebtoken");

exports.checkAuth = (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.json({ isLoggedIn: false, message: "missing Token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.json({ isLoggedIn: false, message: "invalid Token" });
    }

    res.json({
      isLoggedIn: true,
      username: decoded.userName,
    });
  });
};
