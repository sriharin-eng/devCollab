import Project from "../models/project.model.js";
import Workspace from "../models/workspace.model.js";
import User from "../models/user.model.js";
import { logActivity } from "../services/activity.service.js";
import Task from "../models/task.model.js";
import Wiki from "../models/wiki.model.js";

export const createProject = async (req, res) => {
  try {
    const { name, description, workspaceId } = req.body;

    const workspace = req.workspace || (await Workspace.findById(workspaceId));

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    const project = await Project.create({
      name,
      description,
      workspace: workspaceId,
      createdBy: req.user._id,

      members: [
        {
          user: req.user._id,
          role: "Admin",
        },
      ],
    });

    await logActivity({
      workspace: workspaceId,
      project: project._id,
      user: req.user._id,
      action: "created a project",
      entityType: "Project",
      entityId: project._id,
      metadata: {
        projectName: project.name,
      },
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getWorkspaceProjects = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const projects = await Project.find({
      workspace: workspaceId,
    })
      .populate("createdBy", "name email")
      .populate("members.user", "name email avatar");

    res.status(200).json({
      projects,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ── Get single project (with the requester's effective role) ──────────────────
export const getProjectById = async (req, res) => {
  try {
    // req.project / req.projectRole are already populated by requireProjectRole
    const project = await Project.findById(req.project._id)
      .populate("createdBy", "name email")
      .populate("members.user", "name email avatar");

    res.status(200).json({
      project,
      role: req.projectRole,
      workspaceRole: req.workspaceRole,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = req.project || (await Project.findById(projectId));

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    await Task.deleteMany({
      project: projectId,
    });

    await Wiki.deleteMany({
      project: projectId,
    });

    await project.deleteOne();

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ── Add an existing workspace member to this project ───────────────────────────
export const addProjectMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = req.project;

    const allowedRoles = ["Admin", "Member", "Viewer"];
    const newRole = allowedRoles.includes(role) ? role : "Member";

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Must already be a workspace member.
    const inWorkspace = req.workspace.members.some(
      (m) => m.user.toString() === userId,
    );
    if (!inWorkspace) {
      return res.status(400).json({
        message: "User must be added to the workspace before joining a project",
      });
    }

    const alreadyOnProject = project.members.some(
      (m) => m.user.toString() === userId,
    );
    if (alreadyOnProject) {
      return res
        .status(400)
        .json({ message: "User is already on this project" });
    }

    project.members.push({ user: userId, role: newRole });
    await project.save();
    await project.populate("members.user", "name email avatar");

    await logActivity({
      workspace: project.workspace,
      project: project._id,
      user: req.user._id,
      action: `added ${user.name} to the project as ${newRole}`,
      entityType: "Project",
      entityId: project._id,
      metadata: { addedUser: user.name, role: newRole },
    });

    res.status(200).json({ message: "Member added to project", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProjectMemberRole = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;
    const project = req.project;

    const allowedRoles = ["Admin", "Member", "Viewer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const member = project.members.find((m) => m.user.toString() === memberId);
    if (!member) {
      return res
        .status(404)
        .json({ message: "Member not found on this project" });
    }

    member.role = role;
    await project.save();
    await project.populate("members.user", "name email avatar");

    res.status(200).json({ message: "Role updated", project });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeProjectMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const project = req.project;

    project.members = project.members.filter(
      (m) => m.user.toString() !== memberId,
    );
    await project.save();

    res.status(200).json({ message: "Member removed from project" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
