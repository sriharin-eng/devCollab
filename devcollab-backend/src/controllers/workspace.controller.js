import Workspace from "../models/workspace.model.js";
import Project from "../models/project.model.js";
import Task from "../models/task.model.js";
import Wiki from "../models/wiki.model.js";
import User from "../models/user.model.js";
import { logActivity } from "../services/activity.service.js";

export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user._id,

      members: [
        {
          user: req.user._id,
          role: "Owner",
        },
      ],
    });

    res.status(201).json({
      message: "Workspace created successfully",
      workspace,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getUserWorkspaces = async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      "members.user": req.user._id,
    }).populate("members.user", "name email avatar");

    res.status(200).json({
      workspaces,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ── Get single workspace (with the requester's role) ──────────────────────────
export const getWorkspaceById = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId).populate(
      "members.user",
      "name email avatar",
    );

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const membership = workspace.members.find(
      (m) => m.user._id.toString() === req.user._id.toString(),
    );

    if (!membership) {
      return res
        .status(403)
        .json({ message: "You are not a member of this workspace" });
    }

    res.status(200).json({
      workspace,
      role: membership.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Invite / add a member by email ─────────────────────────────────────────────
export const addWorkspaceMember = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    const allowedRoles = ["Admin", "Member", "Viewer"];
    const newRole = allowedRoles.includes(role) ? role : "Member";

    const workspace = req.workspace || (await Workspace.findById(workspaceId));
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const requesterRole = req.workspaceRole;
    // Only Owner can grant/alter Admin membership; Admins can add Member/Viewer.
    if (newRole === "Admin" && requesterRole !== "Owner") {
      return res
        .status(403)
        .json({ message: "Only the workspace owner can add Admins" });
    }

    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({
        message:
          "No DevCollab account found with that email. Ask them to register first.",
      });
    }

    const alreadyMember = workspace.members.some(
      (m) => m.user.toString() === user._id.toString(),
    );
    if (alreadyMember) {
      return res.status(400).json({ message: "That user is already a member" });
    }

    workspace.members.push({ user: user._id, role: newRole });
    await workspace.save();
    await workspace.populate("members.user", "name email avatar");

    await logActivity({
      workspace: workspace._id,
      user: req.user._id,
      action: `added ${user.name} to the workspace as ${newRole}`,
      entityType: "Workspace",
      entityId: workspace._id,
      metadata: { addedUser: user.name, role: newRole },
    });

    res.status(200).json({ message: "Member added", workspace });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Update a member's role ─────────────────────────────────────────────────────
export const updateWorkspaceMemberRole = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;
    const { role } = req.body;

    const allowedRoles = ["Owner", "Admin", "Member", "Viewer"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const workspace = req.workspace || (await Workspace.findById(workspaceId));
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const requesterRole = req.workspaceRole;

    if (workspace.owner.toString() === memberId) {
      return res.status(400).json({
        message:
          "Cannot change the workspace owner's role. Transfer ownership instead.",
      });
    }

    if (role === "Owner") {
      return res
        .status(400)
        .json({ message: "Use the transfer-ownership action instead" });
    }

    // Only the Owner may promote someone to Admin or change an existing Admin's role.
    const member = workspace.members.find(
      (m) => m.user.toString() === memberId,
    );
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    if (
      (role === "Admin" || member.role === "Admin") &&
      requesterRole !== "Owner"
    ) {
      return res
        .status(403)
        .json({ message: "Only the workspace owner can manage Admins" });
    }

    member.role = role;
    await workspace.save();
    await workspace.populate("members.user", "name email avatar");

    res.status(200).json({ message: "Role updated", workspace });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Remove a member ─────────────────────────────────────────────────────────────
export const removeWorkspaceMember = async (req, res) => {
  try {
    const { workspaceId, memberId } = req.params;

    const workspace = req.workspace || (await Workspace.findById(workspaceId));
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    if (workspace.owner.toString() === memberId) {
      return res
        .status(400)
        .json({ message: "Cannot remove the workspace owner" });
    }

    const member = workspace.members.find(
      (m) => m.user.toString() === memberId,
    );
    if (member && member.role === "Admin" && req.workspaceRole !== "Owner") {
      return res
        .status(403)
        .json({ message: "Only the workspace owner can remove Admins" });
    }

    workspace.members = workspace.members.filter(
      (m) => m.user.toString() !== memberId,
    );
    await workspace.save();

    // Also drop them from every project in this workspace.
    await Project.updateMany(
      { workspace: workspaceId },
      { $pull: { members: { user: memberId } } },
    );

    res.status(200).json({ message: "Member removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return res.status(404).json({
        message: "Workspace not found",
      });
    }

    if (workspace.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Only workspace owner can delete workspace",
      });
    }

    const projects = await Project.find({
      workspace: workspaceId,
    });

    const projectIds = projects.map((project) => project._id);

    await Task.deleteMany({
      project: {
        $in: projectIds,
      },
    });

    await Wiki.deleteMany({
      project: {
        $in: projectIds,
      },
    });

    await Project.deleteMany({
      workspace: workspaceId,
    });

    await workspace.deleteOne();

    res.status(200).json({
      message: "Workspace deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
