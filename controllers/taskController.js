const Task = require("../models/Task");

//@desc  GET all  Tasks (Admin : all , User : only assigned tasks)
//@route Get /api/Tasks
//@access private
const getTasks = async (req, res) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    let tasks;

    if (req.user.role == "admin") {
      tasks = await Task.find(filter).populate(
        "assigneesTo",
        "name email profileImageUrl "
      );
    } else {
      tasks = await Task.find({
        ...filter,
        assigneesTo: req.user._id,
      }).populate("assigneesTo", "name email profileImageUrl ");
    }

    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedCount = task.todoChecklist.filter(
          (item) => item.completed
        ).length;
        return { ...task.toObject(), completedTodoCount: completedCount };
      })
    );

    const allTasks = await Task.countDocuments(
      req.user.role === "admin" ? {} : { assigneesTo: req.user._id }
    );

    const pendingTask = await Task.countDocuments({
      ...filter,
      status: "Pending",
      ...(req.user.role !== "admin" && { assigneesTo: req.user._id }),
    });

    const InProgressTasks = await Task.countDocuments({
      ...filter,
      status: "In Progress",
      ...(req.user.role !== "admin" && { assigneesTo: req.user._id }),
    });

    const completedTasks = await Task.countDocuments({
      ...filter,
      status: "Completed",
      ...(req.user.role !== "admin" && { assigneesTo: req.user._id }),
    });

    res.status(200).json({
      message: "Tasks fetched successfully",
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTask,
        InProgressTasks,
        completedTasks,
      },
      error: false,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc  GET Task by ID
//@route Get /api/tasks/
//@access private
const getTasksById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assigneesTo",
      "name email profileImageUrl "
    );
    if (!task) {
      return res.status(404).json({ message: "Task not found", error: true });
    }
    res
      .status(200)
      .json({ message: "Task fetched successfully", task, error: false });
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
        message: "All fields (title, description,  dueDate) are required",
      });
    }

    const validPriorities = ["Low", "Medium", "High"];
    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({
        error: true,
        message: `Invalid priority value. Allowed values are: ${validPriorities.join(
          ", "
        )}`,
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
    const taskId = req.params.id;
    const {
      title,
      description,
      priority,
      dueDate,
      assigneesTo,
      attachments,
      todoChecklist,
    } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found", error: true });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.attachments = attachments || task.attachments;
    task.todoChecklist = todoChecklist || task.todoChecklist;

    if (req.body.assigneesTo) {
      if (!Array.isArray(assigneesTo)) {
        return res.status(400).json({
          message: "assigneesTo must be an array of user IDs",
          error: true,
        });
      }
      task.assigneesTo = req.body.assigneesTo;
    }

    const updateTask = await task.save();

    res
      .status(200)
      .json({ message: "Task updated successfully", updateTask, error: false });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc  delete a task  (Admin )
//@route DELETE /api/tasks/:id
//@access Private (Admin )
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByIdAndDelete(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found", error: true });
    }

    res.status(200).json({
      message: "Task deleted successfully",
      deleteTaskId: id,
    });
    res;
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//@desc  update  task  status
//@route Put /api/tasks/:id/status
//@access Private
const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task)
      return res.status(404).json({ message: "Task not Found", error: false });

    const isAssigned = task.assigneesTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    )

    if(!isAssigned  && req.user.role !== "admin") {
      return res,status(403).json({message:"Not authorized"})
    }


    task.status = req.body.status || task.status


    if(task.status === "Completed") {
      task.todoChecklist.map((item) => {item.completed = true})
      task.progress = 100
    }

    await task.save()

    res.status(200).json({message:"Task status updated", task , error:false})
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
