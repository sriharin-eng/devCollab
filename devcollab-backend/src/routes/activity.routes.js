import express from "express";

import protect from "../middleware/auth.middleware.js";
import { requireWorkspaceRole } from "../middleware/rbac.middleware.js";

import { getWorkspaceActivity } from "../controllers/activity.controller.js";

const router = express.Router();

router.get(
  "/:workspaceId",
  protect,
  requireWorkspaceRole("Viewer"),
  getWorkspaceActivity,
);

export default router;
