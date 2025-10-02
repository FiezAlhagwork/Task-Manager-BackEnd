const express = require("express");
const { adminOnly, protect } = require("../Middleware/authMiddleware");
const router = express.Router();
const {
  getUsers,
  getUserById,
} = require("../controllers/userController");

// User Manager Routers
router.get("/", protect, adminOnly, getUsers); //Get All Users (admin only )
router.get("/:id", protect, getUserById);

module.exports = router;
