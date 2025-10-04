const express = require("express");
const {protect  , adminOnly} = require("../Middleware/authMiddleware")
const {getTasks,getTasksById, getDashboardData, getUserDashboardData, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskCheckList,} = require("../controllers/taskController")
const router = express.Router()


router.get("/dashboard-data", protect , getDashboardData)
router.get('/user-dashboard', protect,getUserDashboardData)
router.get('/', protect, getTasks) // Get all tasks (admin : all , user: assigned )
router.get('/:id', protect, getTasksById) // Get task by ID
router.post("/" , protect, adminOnly , createTask) // create a task (Admin only)
router.put("/:id",protect , updateTask ); // update Task details
router.delete("/:id" ,protect , adminOnly , deleteTask ) // delete a task (admin only )
router.put("/:id/status",protect , updateTaskStatus) // update Task Status 
router.put("/:id/todo",protect,updateTaskCheckList) // update Task check list



module.exports = router