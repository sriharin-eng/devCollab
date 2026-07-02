import Workspace from "../models/workspace.model.js";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import Wiki from "../models/wiki.model.js";

// Higher number = more powerful role.
// Workspace roles: Owner, Admin, Member, Viewer
// Project roles:   Admin, Member, Viewer
export const ROLE_RANK = { Viewer: 0, Member: 1, Admin: 2, Owner: 3 };

const rank = (role) => ROLE_RANK[role] ?? -1;

/**
 * Ensures the requester is a member of the workspace (from req.params.workspaceId
 * or req.body.workspaceId) with at least `minRole`.
 * Attaches req.workspace and req.workspaceRole.
 */
export const requireWorkspaceRole =
  (minRole = "Viewer") =>
  async (req, res, next) => {
    try {
      const workspaceId = req.params.workspaceId || req.body.workspaceId;
      if (!workspaceId) {
        return res.status(400).json({ message: "workspaceId is required" });
      }

      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }

      const membership = workspace.members.find(
        (m) => m.user.toString() === req.user._id.toString(),
      );

      if (!membership) {
        return res
          .status(403)
          .json({ message: "You are not a member of this workspace" });
      }

      if (rank(membership.role) < rank(minRole)) {
        return res.status(403).json({
          message: `This action requires the ${minRole} role or higher (you are ${membership.role})`,
        });
      }

      req.workspace = workspace;
      req.workspaceRole = membership.role;
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

/**
 * Ensures the requester can act on the project (from req.params.projectId or
 * req.body.projectId) with at least `minRole`.
 *
 * Effective role resolution:
 *  - Workspace Owner/Admin always get Admin-level access to every project in
 *    that workspace (so the workspace admins can unblock/manage any project).
 *  - Otherwise, the user's explicit project-level role is used.
 *  - Otherwise, if they are only a workspace member without a project role,
 *    they default to Viewer (can see, can't write) unless they are a
 *    workspace Member, in which case they default to Member on projects
 *    they haven't explicitly been added to (keeps small-team usage simple).
 *
 * Attaches req.project, req.workspace, req.projectRole.
 */
export const requireProjectRole =
  (minRole = "Viewer") =>
  async (req, res, next) => {
    try {
      const projectId = req.params.projectId || req.body.projectId;
      if (!projectId) {
        return res.status(400).json({ message: "projectId is required" });
      }

      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const workspace = await Workspace.findById(project.workspace);
      if (!workspace) {
        return res.status(404).json({ message: "Workspace not found" });
      }

      const wsMembership = workspace.members.find(
        (m) => m.user.toString() === req.user._id.toString(),
      );

      if (!wsMembership) {
        return res
          .status(403)
          .json({ message: "You are not a member of this workspace" });
      }

      const projMembership = project.members.find(
        (m) => m.user.toString() === req.user._id.toString(),
      );

      let effectiveRole;
      if (wsMembership.role === "Owner" || wsMembership.role === "Admin") {
        effectiveRole = "Admin";
      } else if (projMembership) {
        effectiveRole = projMembership.role;
      } else if (wsMembership.role === "Member") {
        effectiveRole = "Member";
      } else {
        effectiveRole = "Viewer";
      }

      if (rank(effectiveRole) < rank(minRole)) {
        return res.status(403).json({
          message: `This action requires the ${minRole} role or higher (you are ${effectiveRole})`,
        });
      }

      req.project = project;
      req.workspace = workspace;
      req.projectRole = effectiveRole;
      req.workspaceRole = wsMembership.role;
      next();
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

/** Resolves a Task's project onto req.params.projectId, then defers to requireProjectRole. */
export const requireProjectRoleViaTask =
  (minRole = "Viewer") =>
  async (req, res, next) => {
    try {
      const task = await Task.findById(req.params.taskId);
      if (!task) return res.status(404).json({ message: "Task not found" });
      req.params.projectId = task.project.toString();
      req.task = task;
      return requireProjectRole(minRole)(req, res, next);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

/** Resolves a Wiki page's project onto req.params.projectId, then defers to requireProjectRole. */
export const requireProjectRoleViaWiki =
  (minRole = "Viewer") =>
  async (req, res, next) => {
    try {
      const wiki = await Wiki.findById(req.params.wikiId);
      if (!wiki)
        return res.status(404).json({ message: "Wiki page not found" });
      req.params.projectId = wiki.project.toString();
      req.wiki = wiki;
      return requireProjectRole(minRole)(req, res, next);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
