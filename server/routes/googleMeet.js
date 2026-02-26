import express from "express";
import { oauth2Client, getAuthUrl, createMeetLink } from "../utils/googleMeetApi.js";
import { verifyToken } from "../middleware/verifyToken.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

const router = express.Router();

// 1. Initiate OAuth Flow
router.get("/auth", verifyToken, async (req, res, next) => {
    try {
        const { projectId } = req.query;
        if (!projectId) return res.status(400).json({ message: "Project ID required." });

        const url = getAuthUrl(projectId);
        res.status(200).json({ authUrl: url });
    } catch (err) {
        next(err);
    }
});

// 2. Handle OAuth Callback
router.get("/callback", async (req, res, next) => {
    try {
        const { code, state } = req.query;
        const projectId = state; // We stored the Project ID here

        const { tokens } = await oauth2Client.getToken(code);

        // In a full implementation, you'd associate this `refresh_token` with the User/Project.
        // For MVP, we'll immediately generate the Meet link using these tokens.

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).send("Project not found.");

        const hangoutLink = await createMeetLink(tokens, project.title);

        // Update Project
        project.meetingLink = hangoutLink;
        await project.save();

        // Redirect back to the frontend project details page
        res.redirect(`${process.env.URL}/projects/${projectId}`);
    } catch (err) {
        console.error("Auth Callback Error:", err);
        res.status(500).send("Error linking Google Meet.");
    }
});

export default router;
