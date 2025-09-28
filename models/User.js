// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "member"],
      default: "member",
    }, // Role-based access
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
