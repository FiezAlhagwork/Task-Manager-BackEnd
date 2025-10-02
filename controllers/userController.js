const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Task = require("../models/Task");

//@desc  GET all  users (Admin only)
//@route Get /api/users
//@access private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "member" }).select("-password");

    if (!users || users.length === 0) {
      res.status(404).json({ message: "users not Found ", error: true });
    }

    //Add task counts to each user
    const usersWithTaskCounts = await Promise.all(
      users.map(async (user) => {
        const pendingTasks = await Task.countDocuments({
          assigneesTo: user._id,
          status: "Pending",
        });
        const inProgressTasks = await Task.countDocuments({
          assigneesTo: user._id,
          status: "In Progress",
        });
        const completedTasks = await Task.countDocuments({
          assigneesTo: user._id,
          status: "Completed",
        });
        return {
          ...user.toObject(),
          pendingTasks,
          inProgressTasks,
          completedTasks,
        };
      })
    );

    //     const usersWithTaskCounts = await Promise.all(
    //   users.map(async (user) => {
    //     const [pendingTasks, inProgressTasks, completedTasks] = await Promise.all([
    //       Task.countDocuments({ assignedTo: user._id, status: "Pending" }),
    //       Task.countDocuments({ assigneesTo: user._id, status: "In Progress" }),
    //       Task.countDocuments({ assigneesTo: user._id, status: "Completed" }),
    //     ]);

    //     return {
    //       ...user._doc,
    //       pendingTasks,
    //       inProgressTasks,
    //       completedTasks,
    //     };
    //   })
    // );

    res.status(200).json({
      message: "Users fetched successfully.",
      users: usersWithTaskCounts,
      error: false,
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

//@desc  Get  user By ID
//@route GET /api/users/:id
//@access privet
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not Found" });
    }

    res.status(200).json({
      message: "User fetched successfully.",
      user,
      error: false,
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

module.exports = { getUserById, getUsers };
