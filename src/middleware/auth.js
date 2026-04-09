const { COOKIE_NAME, verifySession } = require("../lib/jwt");

function getToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7);
  }

  return req.cookies?.[COOKIE_NAME] || null;
}

function requireAuth(req, res, next) {
  try {
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const session = verifySession(token);
    req.user = session;
    return next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ error: "Forbidden" });
  }

  return next();
}

module.exports = { requireAuth, requireAdmin };