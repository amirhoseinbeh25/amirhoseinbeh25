const express = require("express");
const { requireAdmin } = require("../middleware/auth");
const { getSettings, saveSettings } = require("../lib/settings");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(getSettings());
});

router.put("/", requireAdmin, (req, res) => {
  res.json(saveSettings(req.body || {}));
});

module.exports = router;
