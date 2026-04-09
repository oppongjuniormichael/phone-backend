const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change-me";
const COOKIE_NAME = "phone_backend_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function signSession(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function verifySession(token) {
  return jwt.verify(token, JWT_SECRET);
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS * 1000,
    path: "/",
  };
}

module.exports = {
  COOKIE_NAME,
  signSession,
  verifySession,
  sessionCookieOptions,
};