const express = require("express");

const { asyncHandler } = require("../../utils/async-handler");
const { login, logout, me } = require("./auth.controller");

const router = express.Router();

router.post("/login", asyncHandler(login));
router.post("/logout", asyncHandler(logout));
router.get("/me", asyncHandler(me));

module.exports = router;
