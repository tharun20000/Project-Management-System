import mongoose from "mongoose";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import { createError } from "../error.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from 'dotenv';
import Project from "../models/Project.js";
import Works from "../models/Works.js";
import Tasks from "../models/Tasks.js";
import Notifications from "../models/Notifications.js";
import otpGenerator from 'otp-generator';
import { logoSVG } from "../utils/logo.js";


export const addProject = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(createError(404, "User not found"));
  }
  const newProject = new Project({ members: [{ id: user.id, img: user.img, email: user.email, name: user.name, role: "d", access: "Owner" }], ...req.body });
  try {
    const saveProject = await (await newProject.save());
    await User.findByIdAndUpdate(user.id, { $push: { projects: saveProject._id } }, { new: true });
    res.status(200).json(saveProject);
  } catch (err) {
    next(err);
  }
};


export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "Project not found!"));

    const userInProject = project.members.find(m => m.id.toString() === req.user.id);
    if (!userInProject || userInProject.access !== "Owner") {
      return next(createError(403, "Only the project owner can delete this project!"));
    }

    // 1. Find all associated works
    const works = await Works.find({ projectId: project._id });
    const workIds = works.map(w => w._id);

    // 2. Find all associated tasks
    const tasks = await Tasks.find({
      $or: [
        { projectId: project._id },
        { workId: { $in: workIds } }
      ]
    });
    const taskIds = tasks.map(t => t._id);

    // 3. Find all project members for cleanup
    const memberIds = project.members.map(m => m.id);

    // 4. Update all members to remove references
    await User.updateMany(
      { _id: { $in: memberIds } },
      {
        $pull: {
          projects: project._id,
          works: { $in: workIds },
          tasks: { $in: taskIds }
        }
      }
    );

    // 5. Delete actual documents
    await Tasks.deleteMany({ _id: { $in: taskIds } });
    await Works.deleteMany({ _id: { $in: workIds } });
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json("Project and all associated content deleted successfully.");

  } catch (err) {
    next(err);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate("members.id", "_id  name email img");
    var verified = false
    await Promise.all(
      project.members.map(async (Member) => {
        if (Member.id.id === req.user.id) {
          verified = true
        }
      })
    )
      .then(() => {
        if (verified) {
          return res.status(200).json(project);
        } else {
          return next(createError(403, "You are not allowed to view this project!"));
        }
      });

  } catch (err) {
    next(err);
  }
};


export const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "project not found!"));
    for (let i = 0; i < project.members.length; i++) {
      if (project.members[i].id.toString() === req.user.id.toString()) {
        if (project.members[i].access === "Owner" || project.members[i].access === "Admin" || project.members[i].access === "Editor") {
          const updatedproject = await Project.findByIdAndUpdate(
            req.params.id,
            {
              $set: req.body,
            },
            { new: true }
          );
          res.status(200).json({ message: "Project has been updated..." });
        } else {
          return next(createError(403, "You are not allowed to update this project!"));
        }
      }
    }
    return next(createError(403, "You can update only if you are a member of this project!"));
  } catch (err) {
    next(err);
  }
};

export const updateMembers = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "project not found!"));
    for (let i = 0; i < project.members.length; i++) {
      if (project.members[i].id.toString() === req.user.id.toString()) {
        if (project.members[i].access === "Owner" || project.members[i].access === "Admin" || project.members[i].access === "Editor") {
          //update single member inside members array
          const updatedproject = await Project.findByIdAndUpdate(
            req.params.id,
            {
              $set: {
                "members.$[elem].access": req.body.access,
                "members.$[elem].role": req.body.role,
              },
            },
            {
              arrayFilters: [{ "elem.id": req.body.id }],
              new: true,
            }
          );
          res.status(200).json({ message: "Member has been updated..." });
        } else {
          return next(createError(403, "You are not allowed to update this project!"));
        }
      }
    }
    return next(createError(403, "You can update only if you are a member of this project!"));

  } catch (err) {
    next(err);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "project not found!"));
    for (let i = 0; i < project.members.length; i++) {
      if (project.members[i].id.toString() === req.user.id.toString()) {
        if (project.members[i].access === "Owner" || project.members[i].access === "Admin" || project.members[i].access === "Editor") {

          await Project.findByIdAndUpdate(
            req.params.id,
            {
              $pull: {
                //remove the meber with the id
                members: { id: req.body.id }
              }
            },
            {
              new: true,
            }
          )
            .exec();

          await User.findByIdAndUpdate(
            req.body.id,
            {
              $pull: {
                projects: req.params.id,
              }
            },
            {
              new: true,
            }
          ).exec()
            .then((user) => {
              res.status(200).json({ message: "Member has been removed..." });

            }).catch((err) => {
              console.log(err);
            })

        } else {
          return next(createError(403, "You are not allowed to update this project!"));
        }
      }
    }
    return next(createError(403, "You can update only if you are a member of this project!"));

  } catch (err) {
    next(err);
  }
};


dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  },
  port: 465,
  host: 'smtp.gmail.com'
});

export const inviteProjectMember = async (req, res, next) => {
  //send mail using nodemailer
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(createError(404, "User not found"));
  }
  const project = await Project.findById(req.params.id);
  if (!project) return next(createError(404, "Project not found!"));

  // Check if invited user exists
  const invitedUser = await User.findById(req.body.id);
  if (!invitedUser) return next(createError(404, "Invited user not found! Please ask them to register first."));

  // Check if user is already a member
  const isMember = project.members.some(m => m.id.toString() === req.body.id);
  if (isMember) return next(createError(403, "User is already a member of this project!"));

  req.app.locals.CODE = await otpGenerator.generate(8, { upperCaseAlphabets: true, specialChars: true, lowerCaseAlphabets: true, digits: true, });
  dotenv.config();
  const link = `${process.env.URL}/projects/invite/${req.app.locals.CODE}?projectid=${req.params.id}&userid=${req.body.id}&access=${req.body.access}&role=${req.body.role}`;
  const mailBody = `
  <div style="font-family: Poppins, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px; border: 1px solid #ccc; border-radius: 5px;">
    ${logoSVG}
    <div style="text-align: center; margin-bottom: 20px;">
        <img src="${invitedUser.img}" alt="${invitedUser.name}'s Avatar" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #854CE6; background-color: #fff;">
    </div>
    <h1 style="font-size: 22px; font-weight: 500; color: #854CE6; text-align: center; margin-bottom: 30px;">Invitation to Join Project</h1>
    <div style="background-color: #FFF; border: 1px solid #e5e5e5; border-radius: 5px; box-shadow: 0px 3px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #854CE6; border-top-left-radius: 5px; border-top-right-radius: 5px; padding: 20px 0;">
            <h2 style="font-size: 28px; font-weight: 500; color: #FFF; text-align: center; margin-bottom: 10px;"><b>${project.title}</b></h2>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">Hello ${req.body.name},</p>
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">You've been invited to join a project called <b>${project.title}</b> on DevSync by <b>${user.name}</b>.</p>
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">To accept the invitation and join the project, please click on the button below:</p>
            <div style="text-align: center; margin-bottom: 30px;">
                <a href=${link} style="background-color: #854CE6; color: #FFF; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: bold;">Accept Invitation</a>
            </div>
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">If you have any questions or issues with joining the project, please contact  <b>${user.name}</b> for assistance.</p>
        </div>
    </div>
    <br>
    <p style="font-size: 16px; color: #666; margin-top: 30px;">Best regards,</p>
    <p style="font-size: 16px; color: #666; margin-bottom: 20px; text-align: center;">The DevSync Team</p>
</div>
`

  for (let i = 0; i < project.members.length; i++) {
    if (project.members[i].id.toString() === req.user.id) {
      if (project.members[i].access.toString() === "Owner" || project.members[i].access.toString() === "Admin" || project.members[i].access.toString() === "Editor") {
        const mailOptions = {
          from: process.env.EMAIL,
          to: req.body.email,
          subject: `Invitation to join project ${project.title}`,
          html: mailBody
        };
        transporter.sendMail(mailOptions, (err, data) => {
          if (err) {
            return next(err);
          } else {
            return res.status(200).json({ message: "Email sent successfully" });
          }
        });
      } else {
        return next(createError(403, "You are not allowed to invite members to this project!"));
      }
    }
  }

};

//verify invitation and add to project member
export const verifyInvitation = async (req, res, next) => {
  try {
    const { projectid, userid, access, role } = req.query;
    const code = req.params.code;
    if (code === req.app.locals.CODE) {
      req.app.locals.CODE = null;
      req.app.locals.resetSession = true;
      const project = await Project.findById(projectid);
      if (!project) return next(createError(404, "Project not found!"));
      const user = await User.findById(userid);
      if (!user) {
        return next(createError(404, "User not found"));
      }

      for (let i = 0; i < project.members.length; i++) {
        if (project.members[i].id === user.id) {
          return next(createError(403, "You are already a member of this project!"));
        }
      }
      const newMember = { id: user.id, role: role, access: access };
      const updatedProject = await Project.findByIdAndUpdate(
        projectid,
        {
          $push: { members: newMember },
        },
        { new: true }
      );
      await User.findByIdAndUpdate(user.id, { $push: { projects: updatedProject._id } }, { new: true });
      res.status(200).json({ Message: "You have successfully joined the PROJECT!" });
    }
    return res.status(400).json({ Message: "Invalid Lnk- Link Expired !" });
  } catch (err) {
    next(err);
  }
};


export const getProjectMembers = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "Project not found!"));
    res.status(200).json(project.members);
  } catch (err) {
    next(err);
  }
}

//add works to project
export const addWork = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "Project not found!"));

    const userInProject = project.members.find(m => m.id.toString() === req.user.id);
    if (!userInProject || !["Owner", "Admin", "Editor"].includes(userInProject.access)) {
      return next(createError(403, "You are not allowed to add works to this project!"));
    }

    const taskIds = [];
    const taskData = req.body.tasks || [];

    // Create Tasks
    for (const t of taskData) {
      const newTask = new Tasks({
        ...t,
        projectId: project._id,
        members: [...new Set(t.members)],
      });
      const savedTask = await newTask.save();
      taskIds.push(savedTask._id);
    }

    // Create Work
    const newWork = new Works({
      ...req.body,
      projectId: project._id,
      creatorId: user._id,
      tasks: taskIds,
    });
    const savedWork = await newWork.save();

    // Link workId to Tasks
    await Tasks.updateMany({ _id: { $in: taskIds } }, { workId: savedWork._id });

    // Link Work to Project
    await Project.findByIdAndUpdate(project._id, { $push: { works: savedWork._id } });

    // Link Work and Tasks to Users and send Notifications
    for (let k = 0; k < taskData.length; k++) {
      const memberIds = [...new Set(taskData[k].members)];
      const currentTaskId = taskIds[k];

      for (const memberId of memberIds) {
        await User.findByIdAndUpdate(memberId, {
          $addToSet: {
            works: savedWork._id,
            tasks: currentTaskId,
          },
        });

        // Create Notification
        const newNotification = new Notifications({
          link: project._id,
          type: "task",
          message: `"${user.name}" added you to task "${taskData[k].task}" in work "${savedWork.title}" in project "${project.title.toUpperCase()}".`,
        });
        const savedNote = await newNotification.save();
        await User.findByIdAndUpdate(memberId, { $push: { notifications: savedNote._id } });
      }
    }

    res.status(200).json(savedWork);
  } catch (err) {
    next(err);
  }
};



//work 

//get works
export const getWorks = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(createError(404, "Project not found!"));
    const works = await Works

      .find({ projectId: req.params.id })
      .populate("tasks")
      .populate("creatorId", "name img")
      .populate({
        path: "tasks",
        populate: {
          path: "members",
          select: "name img",
        },
      })
      .sort({ createdAt: -1 });
    res.status(200).json(works);
  } catch (err) {
    next(err);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Tasks.findById(req.params.taskId);
    if (!task) return next(createError(404, "Task not found!"));

    const project = await Project.findById(task.projectId);
    if (!project) return next(createError(404, "Project not found!"));

    const userInProject = project.members.find(m => m.id.toString() === req.user.id);
    if (!userInProject) return next(createError(403, "You are not a member of this project!"));

    const isAssigned = task.members.some(mId => mId.toString() === req.user.id);
    const isOwnerOrAdmin = ["Owner", "Admin"].includes(userInProject.access);

    if (!isAssigned && !isOwnerOrAdmin) {
      return next(createError(403, "Only the assigned user or an admin can update this task status!"));
    }

    task.status = req.body.status;
    await task.save();

    res.status(200).json({ message: "Task status updated", task });
  } catch (err) {
    next(err);
  }
};

export const updateWorkStatus = async (req, res, next) => {
  try {
    const work = await Works.findById(req.params.workId);
    if (!work) return next(createError(404, "Work not found!"));

    const project = await Project.findById(work.projectId);
    if (!project) return next(createError(404, "Project not found!"));

    const userInProject = project.members.find(m => m.id.toString() === req.user.id);
    if (!userInProject) return next(createError(403, "You are not a member of this project!"));

    const isCreator = work.creatorId.toString() === req.user.id;
    const isOwnerOrAdmin = ["Owner", "Admin"].includes(userInProject.access);

    if (!isCreator && !isOwnerOrAdmin) {
      return next(createError(403, "Only the creator or an admin can update this work status!"));
    }

    work.status = req.body.status;
    await work.save();

    res.status(200).json({ message: "Work status updated", work });
  } catch (err) {
    next(err);
  }
};
