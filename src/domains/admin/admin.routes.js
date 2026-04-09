const express = require("express");

const { asyncHandler } = require("../../utils/async-handler");
const { requireAuth, requireAdmin } = require("../../middleware/auth");
const { getStats, adjustStock } = require("./admin.controller");

const router = express.Router();

router.get("/stats", asyncHandler(getStats));
router.patch("/stock/:id", requireAuth, requireAdmin, asyncHandler(adjustStock));

module.exports = router;
