import express from "express";

import protect from "../middleware/auth.middleware.js";
import {
  requireWorkspaceRole,
  requireProjectRole,
} from "../middleware/rbac.middleware.js";

import {
  createProject,
  getWorkspaceProjects,
  getProjectById,
  deleteProject,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
} from "../controllers/project.controller.js";

const router = express.Router();

// Creating a project requires at least Member in the workspace (Viewers can't create).
router.post("/", protect, requireWorkspaceRole("Member"), createProject);

router.get(
  "/:workspaceId",
  protect,
  requireWorkspaceRole("Viewer"),
  getWorkspaceProjects,
);

router.get(
  "/detail/:projectId",
  protect,
  requireProjectRole("Viewer"),
  getProjectById,
);

router.delete(
  "/:projectId",
  protect,
  requireProjectRole("Admin"),
  deleteProject,
);

// ── Project member management (Admin only) ─────────────────────────────────────
router.post(
  "/:projectId/members",
  protect,
  requireProjectRole("Admin"),
  addProjectMember,
);

router.patch(
  "/:projectId/members/:memberId",
  protect,
  requireProjectRole("Admin"),
  updateProjectMemberRole,
);

router.delete(
  "/:projectId/members/:memberId",
  protect,
  requireProjectRole("Admin"),
  removeProjectMember,
);

export default router;
