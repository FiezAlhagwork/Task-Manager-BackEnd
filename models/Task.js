const mongoose = require("mongoose");


const todoSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In progress", "Completed"],
      default: "Pending",
      index: true,
    },
    dueDate: {
      type: Date,
    },
    assigneesTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    attachments: [{ type: String }],
    todoChecklist: [todoSchema],
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task",taskSchema)