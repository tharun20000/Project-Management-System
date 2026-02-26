import express from "express";
import { createZoomMeeting } from "../utils/zoomApi.js";
import { verifyToken } from "../middleware/verifyToken.js";
import Project from "../models/Project.js";
import User from "../models/User.js";
import nodemailer from "nodemailer";

const router = express.Router();

router.post("/create", verifyToken, async (req, res, next) => {
    console.log("Zoom route hit with body:", req.body);
    try {
        const { projectId } = req.body;
        if (!projectId) return res.status(400).json({ message: "Project ID required." });

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).send("Project not found.");

        const meetingInfo = await createZoomMeeting(project.title);

        const joinLink = meetingInfo.join_url;

        // Update Project with the newly created Zoom Meeting link using findByIdAndUpdate 
        // to avoid validation errors on older documents missing new fields
        await Project.findByIdAndUpdate(projectId, { $set: { meetingLink: joinLink } });

        // Send email to all project members
        const memberIds = project.members.map(member => member.id);
        const members = await User.find({ _id: { $in: memberIds } });
        const emails = members.map(m => m.email).filter(Boolean); // Ensure valid emails

        if (emails.length > 0) {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: process.env.EMAIL_USERNAME,
                    pass: process.env.EMAIL_PASSWORD
                },
                port: 465,
                host: 'smtp.gmail.com'
            });

            const mailOptions = {
                from: process.env.EMAIL,
                bcc: emails, // Use BCC so members don't see everyone else's email address
                subject: `New Zoom Meeting created for Project: ${project.title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <h2 style="color: #2D8CFF;">A new Zoom meeting has been scheduled!</h2>
                        <p><strong>Project:</strong> ${project.title}</p>
                        <p>A new sync meeting has been created. You can join using the link below:</p>
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="${joinLink}" style="background-color: #2D8CFF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Zoom Meeting</a>
                        </p>
                        <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="color: #666; font-size: 14px; word-break: break-all;"><a href="${joinLink}">${joinLink}</a></p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions).catch(err => {
                console.error("Failed to send Zoom meeting notification emails:", err);
            });
        }

        res.status(200).json({ meetingLink: joinLink, start_url: meetingInfo.start_url });
    } catch (err) {
        console.error("Zoom Meeting Creation Route Error:", err);
        res.status(500).json({ message: err.message || "Error generating Zoom Meeting." });
    }
});

export default router;
