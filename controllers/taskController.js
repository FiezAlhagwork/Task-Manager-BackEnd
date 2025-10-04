const Task = require("../models/Task");

//@desc  GET all  Tasks (Admin : all , User : only assigned tasks)
//@route Get /api/Tasks
//@access private
const getTasks = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
//@desc  GET Task by ID
//@route Get /api/tasks/
//@access private
const getTasksById = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc  create a new task (Admin only)
//@route POST /api/tasks/
//@access Private (Admin)
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assigneesTo,
      attachments,
      todoChecklist,
    } = req.body;

    if (!title || !description || !dueDate) {
      return res.status(400).json({
        error: true,
        message:
          "All fields (title, description,  dueDate) are required",
      });
    }

    const validPriorities = ["Low", "Medium", "High"];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        error: true,
        message: `Invalid priority value. Allowed values are: ${validPriorities.join(", ")}`,
      });
    }

    if (!Array.isArray(assigneesTo) || assigneesTo.length === 0) {
      return res.status(400).json({
        error: true,
        message: "assigneesTo must be an array of user IDs",
      });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assigneesTo,
      createBy: req.user._id,
      todoChecklist,
      attachments,
    });

    res
      .status(201)
      .json({ message: "Task created Successfully ", task, error: true });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
//@desc   Updata  task details
//@route PUT /api/tasks/:id
//@access Private
const updateTask = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc  delete a task  (Admin )
//@route DELETE /api/tasks/:id
//@access Private (Admin )
const deleteTask = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc  update  task  status
//@route Put /api/tasks/:id/status
//@access Private
const updateTaskStatus = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc  update  task  checkList
//@route Put /api/tasks/:id/todo
//@access Private
const updateTaskCheckList = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc  Dashboard data  (Admin only)
//@route get /api/tasks/dashboard
//@access Private (Admin)
const getDashboardData = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
//@desc  Dashboard data  (User-specific)
//@route get /api/tasks/user-dashboard
//@access Private (Admin)
const getUserDashboardData = async (req, res) => {
  try {
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getTasks,
  getTasksById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskCheckList,
  getDashboardData,
  getUserDashboardData,
};
