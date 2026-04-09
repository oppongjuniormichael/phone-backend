const express = require("express");

const { asyncHandler } = require("../../utils/async-handler");
const { requireAuth, requireAdmin } = require("../../middleware/auth");
const {
  listPhones,
  getPhone,
  createPhone,
  updatePhone,
  deletePhone,
} = require("./phones.controller");

const router = express.Router();

router.get("/", asyncHandler(listPhones));
router.get("/:id", asyncHandler(getPhone));
router.post("/", requireAuth, requireAdmin, asyncHandler(createPhone));
router.put("/:id", requireAuth, requireAdmin, asyncHandler(updatePhone));
router.delete("/:id", requireAuth, requireAdmin, asyncHandler(deletePhone));

module.exports = router;
