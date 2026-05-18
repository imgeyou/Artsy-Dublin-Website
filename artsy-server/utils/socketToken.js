const crypto = require("crypto");

const SECRET = process.env.SOCKET_SECRET ?? "dev-socket-secret";

function createSocketToken(userId) {
  const exp = Date.now() + 3_600_000; // 1 hour
  const payload = `${userId}|${exp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${payload}|${sig}`;
}

function verifySocketToken(token) {
  const parts = (token ?? "").split("|");
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  if (Date.now() > Number(exp)) return null;
  const payload = `${userId}|${exp}`;
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
  const sigBuf = Buffer.from(sig, "hex");
  const expBuf = Buffer.from(expected, "hex");
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  return Number(userId);
}

module.exports = { createSocketToken, verifySocketToken };
