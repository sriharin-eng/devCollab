import Wiki from "../models/wiki.model.js";
import Project from "../models/project.model.js";

import { logActivity } from "../services/activity.service.js";

export const createWikiPage = async (req, res) => {
  try {
    const { title, content, projectId } = req.body;

    const wiki = await Wiki.create({
      title,
      content,
      project: projectId,
      createdBy: req.user._id,

      versions: [
        {
          content,
          updatedBy: req.user._id,
        },
      ],
    });

    const project = req.project || (await Project.findById(projectId));

    await logActivity({
      workspace: project.workspace,
      project: projectId,
      user: req.user._id,
      action: "created wiki page",
      entityType: "Project",
      entityId: wiki._id,
      metadata: {
        title,
      },
    });

    res.status(201).json({
      message: "Wiki page created",
      wiki,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getProjectWikiPages = async (req, res) => {
  try {
    const { projectId } = req.params;

    const pages = await Wiki.find({
      project: projectId,
    }).populate("createdBy", "name email");

    res.status(200).json({
      pages,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateWikiPage = async (req, res) => {
  try {
    const { wikiId } = req.params;

    const { content } = req.body;

    const wiki = req.wiki || (await Wiki.findById(wikiId));

    if (!wiki) {
      return res.status(404).json({
        message: "Wiki page not found",
      });
    }

    wiki.content = content;

    wiki.versions.push({
      content,
      updatedBy: req.user._id,
    });

    await wiki.save();

    res.status(200).json({
      message: "Wiki updated",
      wiki,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
