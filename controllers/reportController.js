const Task = require("../models/Task");
const User = require("../models/User");
const excelJS = require("exceljs");

//@desc  Export all Tasks as an Excel file
//@route GET /api/reports/export/tasks
//@access Private (Admin)
const exportTasksReport = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assigneesTo", "name email");

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tasks Report");

    worksheet.columns = [
      { header: "Task ID", key: "_id", width: 25 },
      { header: "Title", key: "title", width: 30 },
      { header: "Description", key: "description", width: 30 },
      { header: "Status", key: "status", width: 15 },
      { header: "Priority", key: "priority", width: 15 },
      { header: "Due Date", key: "dueDate", width: 20 },
      { header: "assigneesTo", key: "assigneesTo", width: 40 },
    ];

    tasks.forEach((task) => {
      const assignedTo = tasks.assigneesTo
        .map((user) => `${user.name} (${user.email})`)
        .join(", ");
      worksheet.addRow({
        _id: task._id,
        title: task.title,
        description: task.description,
        Priority: task.priority,
        status: task.status,
        dueDate: task.dueDate.toISOString().split("T")[0],
        assigneesTo: assignedTo || "No Assignees",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename='tasks_report.xlsx'"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

//@desc  Export  user-task as an Excel file
//@route GET /api/reports/export/users
//@access Private (Admin)
const exportUsersReport = async (req, res) => {
  try {
    const users = await User.find().select("name email _id").lean();
    const userTask = await Task.find().populate(
      "assigneesTo",
      "name email _id"
    );

    const userTaskMap = {};
    users.forEach((user) => {
      userTaskMap[user._id] = {
        name: user.name,
        email: user.email,
        tasksCount: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
      };
    });

    userTask.forEach((task) => {
      if (task.assigneesTo && task.assigneesTo.length > 0) {
        task.assigneesTo.forEach((user) => {
          if (userTaskMap[user._id]) {
            userTaskMap[user._id].tasksCount += 1;
            if (task.status === "Pending")
              userTaskMap[user._id].pendingTasks += 1;
            else if (task.status === "In progress")
              userTaskMap[user._id].inProgressTasks += 1;
            else if (task.status === "Completed")
              userTaskMap[user._id].completedTasks += 1;
          }
        });
      }
    });

    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users Task Report");
    worksheet.columns = [
      { header: "User ID", key: "_id", width: 25 },
      { header: "Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 30 },
      { header: "Total Tasks", key: "tasksCount", width: 15 },
      { header: "Pending Tasks", key: "pendingTasks", width: 15 },
      { header: "In Progress Tasks", key: "inProgressTasks", width: 15 },
      { header: "Completed Tasks", key: "completedTasks", width: 15 },
    ];

    Object.values(userTaskMap).forEach((user) => {
      worksheet.addRow(user);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename='users_task_report.xlsx'"
    );

    await workbook.xlsx.write(res).then(() => {
      res.end();
    });
  } catch (error) {
    res.status(500).json({ message: "server error", error: error.message });
  }
};

module.exports = { exportTasksReport, exportUsersReport };
