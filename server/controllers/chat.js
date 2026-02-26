import Chat from "../models/Chat.js";
import Project from "../models/Project.js";

export const createChat = async (req, res, next) => {
    try {
        const existingChat = await Chat.findOne({
            members: { $all: [req.body.senderId, req.body.receiverId] },
        });

        if (existingChat) {
            return res.status(200).json(existingChat);
        }

        const newChat = new Chat({
            members: [req.body.senderId, req.body.receiverId],
        });
        const result = await newChat.save();
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const userChats = async (req, res, next) => {
    try {
        const chats = await Chat.find({
            members: { $in: [req.params.userId] },
        }).populate("members", "name img email");
        res.status(200).json(chats);
    } catch (error) {
        next(error);
    }
};

export const findChat = async (req, res, next) => {
    try {
        const chat = await Chat.findOne({
            members: { $all: [req.params.firstId, req.params.secondId] },
        });
        res.status(200).json(chat);
    } catch (error) {
        next(error);
    }
};

export const getProjectChat = async (req, res, next) => {
    try {
        // Find existing chat for this project
        const chat = await Chat.findOne({ projectId: req.params.projectId })
            .populate("members", "name img email");

        if (chat) {
            return res.status(200).json(chat);
        }

        // If not found, create one
        const project = await Project.findById(req.params.projectId).populate("members.id");
        if (!project) return res.status(404).json({ message: "Project not found" });

        // Extract member IDs
        const memberIds = project.members.map(m => m.id._id);

        const newChat = new Chat({
            members: memberIds,
            projectId: req.params.projectId,
            isGroupChat: true,
            groupName: `${project.title} Group Chat`,
            groupAdmin: project.members.find(m => m.role === "admin" || m.access === "Owner")?.id._id || req.user.id
        });

        const savedChat = await newChat.save();
        const populatedChat = await Chat.findById(savedChat._id).populate("members", "name img email");

        res.status(200).json(populatedChat);
    } catch (error) {
        next(error);
    }
};
