import express from "express";

import protect from "../middleware/auth.middleware.js";
import { requireWorkspaceRole } from "../middleware/rbac.middleware.js";

import {
  createWorkspace,
  getUserWorkspaces,
  getWorkspaceById,
  deleteWorkspace,
  addWorkspaceMember,
  updateWorkspaceMemberRole,
  removeWorkspaceMember,
} from "../controllers/workspace.controller.js";

const router = express.Router();

router.post("/", protect, createWorkspace);

router.get("/", protect, getUserWorkspaces);

router.get(
  "/:workspaceId",
  protect,
  requireWorkspaceRole("Viewer"),
  getWorkspaceById,
);

router.delete(
  "/:workspaceId",
  protect,
  requireWorkspaceRole("Owner"),
  deleteWorkspace,
);

// ── Member management ──────────────────────────────────────────────────────────
router.post(
  "/:workspaceId/members",
  protect,
  requireWorkspaceRole("Admin"),
  addWorkspaceMember,
);

router.patch(
  "/:workspaceId/members/:memberId",
  protect,
  requireWorkspaceRole("Admin"),
  updateWorkspaceMemberRole,
);

router.delete(
  "/:workspaceId/members/:memberId",
  protect,
  requireWorkspaceRole("Admin"),
  removeWorkspaceMember,
);

export default router;
