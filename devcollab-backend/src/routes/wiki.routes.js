import express from "express";

import protect from "../middleware/auth.middleware.js";
import {
  requireProjectRole,
  requireProjectRoleViaWiki,
} from "../middleware/rbac.middleware.js";

import {
  createWikiPage,
  getProjectWikiPages,
  updateWikiPage,
} from "../controllers/wiki.controller.js";

const router = express.Router();

router.post("/", protect, requireProjectRole("Member"), createWikiPage);

router.get(
  "/:projectId",
  protect,
  requireProjectRole("Viewer"),
  getProjectWikiPages,
);

router.patch(
  "/:wikiId",
  protect,
  requireProjectRoleViaWiki("Member"),
  updateWikiPage,
);

export default router;
