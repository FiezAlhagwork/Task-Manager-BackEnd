const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const generateToken = (userid) => {
  return jwt.sign({ id: userid }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

//@desc Register a new user
//@route POST /api/auth/register
//@access Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, profileImageUrl, adminInviteToken } =
      req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    let role = "member";
    if (
      adminInviteToken &&
      adminInviteToken === process.env.ADMIN_INVITE_TOKEN
    ) {
      role = "admin";
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      profileImageUrl,
      role,
    });

    await user.save();

    // Generate token after user is created
    const token = generateToken(user._id);

    // Respond with user info (excluding password)
    return res.status(201).json({
      message: "User registered successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
      },
      error: false,
      token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error.", error: error.message });
  }
};

//@desc Login a user
//@route POST /api/auth/login
//@access Public
const loginUser = async (req, res) => {
  try {
    const { password, email } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "User logged successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImageUrl: user.profileImageUrl,
        role: user.role,
      },
      error: false,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

//@desc get user profile
//@route GET /api/auth/profile
//@access private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findOne(req.user._id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not Found", error: true });
    }

    res.status(200).json({
      message: "User profile fetched successfully.",
      user,
      error: false,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

//@desc Update user profile
//@route PUT /api/auth/profile
//@access private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not Found", error: true });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.getSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "User profile updated successfully.",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      },
      error: false,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error.", error: error.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };
