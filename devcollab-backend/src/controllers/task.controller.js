import { io } from "../server.js";
import Task from "../models/task.model.js";
import Project from "../models/project.model.js";
import { logActivity } from "../services/activity.service.js";

export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      labels,
      projectId,
      assignee,
    } = req.body;

    const project = req.project || (await Project.findById(projectId));

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      labels,
      project: projectId,
      assignee,
      createdBy: req.user._id,
    });

    io.to(projectId).emit("taskCreated", task);

    await logActivity({
      workspace: project.workspace,
      project: project._id,
      user: req.user._id,
      action: "created a task",
      entityType: "Task",
      entityId: task._id,
      metadata: {
        taskTitle: task.title,
      },
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const tasks = await Task.find({
      project: projectId,
    })
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("comments.user", "name email");

    res.status(200).json({
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;

    const { status } = req.body;

    const task = req.task || (await Task.findById(taskId));

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = req.project || (await Project.findById(task.project));

    task.status = status;

    await task.save();

    io.to(task.project.toString()).emit("taskUpdated", task);

    await logActivity({
      workspace: project.workspace,
      project: task.project,
      user: req.user._id,
      action: `moved task to ${status}`,
      entityType: "Task",
      entityId: task._id,
      metadata: {
        status,
      },
    });

    res.status(200).json({
      message: "Task status updated",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;

    const { text } = req.body;

    const task = req.task || (await Task.findById(taskId));

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const project = req.project || (await Project.findById(task.project));

    task.comments.push({
      user: req.user._id,
      text,
    });

    await task.save();
    await task.populate("comments.user", "name email");

    io.to(task.project.toString()).emit("commentAdded", task);

    await logActivity({
      workspace: project.workspace,
      project: task.project,
      user: req.user._id,
      action: "added a comment",
      entityType: "Comment",
      entityId: task._id,
    });

    res.status(200).json({
      message: "Comment added",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const task = req.task || (await Task.findById(taskId));

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Project Admins (incl. workspace Owner/Admin) can delete any task;
    // otherwise only the task's own creator can delete it.
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    const isProjectAdmin = req.projectRole === "Admin";

    if (!isCreator && !isProjectAdmin) {
      return res.status(403).json({
        message: "Not authorized to delete this task",
      });
    }

    await task.deleteOne();

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
