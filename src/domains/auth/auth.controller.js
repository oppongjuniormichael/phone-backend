const bcrypt = require("bcryptjs");
const { prisma } = require("../../lib/prisma");
const { COOKIE_NAME, signSession, sessionCookieOptions } = require("../../lib/jwt");

function toSafeUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signSession({ sub: user.id, email: user.email, name: user.name, role: user.role });

  res.cookie(COOKIE_NAME, token, sessionCookieOptions());
  return res.json({ user: toSafeUser(user) });
}

async function logout(_req, res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  return res.json({ ok: true });
}

async function me(req, res) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const session = require("../../lib/jwt").verifySession(token);
    return res.json({ user: session });
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

module.exports = { login, logout, me, toSafeUser };
