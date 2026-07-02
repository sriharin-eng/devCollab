import express from "express";

import protect from "../middleware/auth.middleware.js";
import {
  requireProjectRole,
  requireProjectRoleViaTask,
} from "../middleware/rbac.middleware.js";

import {
  createTask,
  getProjectTasks,
  updateTaskStatus,
  addComment,
  deleteTask,
} from "../controllers/task.controller.js";

const router = express.Router();

// Viewers can look, but only Member+ can create/write.
router.post("/", protect, requireProjectRole("Member"), createTask);

router.get(
  "/:projectId",
  protect,
  requireProjectRole("Viewer"),
  getProjectTasks,
);

router.patch(
  "/:taskId/status",
  protect,
  requireProjectRoleViaTask("Member"),
  updateTaskStatus,
);

router.post(
  "/:taskId/comments",
  protect,
  requireProjectRoleViaTask("Member"),
  addComment,
);

router.delete(
  "/:taskId",
  protect,
  requireProjectRoleViaTask("Viewer"), // fine-grained check happens in controller (creator OR Admin)
  deleteTask,
);

export default router;
