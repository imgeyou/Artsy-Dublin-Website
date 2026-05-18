const { admin } = require("../utils/firebaseAdmin");
const usersModel = require("../models/users")

async function authenticate(req, res, next) {
  const sessionCookie = req.cookies.session;
  if (!sessionCookie) return res.json("No session");

  try {
    const decoded = await admin
      .auth()
      .verifySessionCookie(sessionCookie, true);
      //res.json({sessionCookie});
      
    const dbUser = await usersModel.getUserByFirebaseUid(decoded.uid);
    if (!dbuser) return res.status(404).json({
      error: "User not found"
    })
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      ...dbUser
    }
    next();
  } catch {
    res.status(401).json({ error: "Invalid session" });
  }
}

module.exports = {
  authenticate,
};
