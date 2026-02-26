import { createError } from "../error.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Teams from "../models/Teams.js";
import Notifications from "../models/Notifications.js";
import Works from "../models/Works.js";
import Tasks from "../models/Tasks.js";

export const update = async (req, res, next) => {
  if (req.params.id === req.user.id) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      next(err);
    }
  } else {
    return next(createError(403, "You can update only your account!"));
  }
}

export const deleteUser = async (req, res, next) => {
  if (req.params.id === req.user.id) {
    try {
      const userId = req.user.id;

      // 1. PROJECTS CLEANUP
      // Find all projects where user is a member
      const projects = await Project.find({ "members.id": userId });

      for (const project of projects) {
        const memberInfo = project.members.find(m => m.id.toString() === userId);

        if (memberInfo && memberInfo.access === "Owner") {
          // USER IS OWNER: Delete the entire project and its contents

          // Get all Works in this project
          const works = await Works.find({ projectId: project._id });
          const workIds = works.map(w => w._id);

          // Get all Tasks in this project
          const tasks = await Tasks.find({ projectId: project._id });
          const taskIds = tasks.map(t => t._id); // Tasks in this project

          // Cleanup references in ALL users (e.g., removing these tasks/works from their lists)
          await User.updateMany(
            {},
            {
              $pull: {
                projects: project._id,
                works: { $in: workIds },
                tasks: { $in: taskIds }
              }
            }
          );

          // Delete actual documents
          await Tasks.deleteMany({ projectId: project._id });
          await Works.deleteMany({ projectId: project._id });
          await Project.findByIdAndDelete(project._id);

        } else {
          // USER IS JUST A MEMBER: Remove them from the project
          await Project.findByIdAndUpdate(project._id, {
            $pull: { members: { id: userId } }
          });
        }
      }

      // 2. TEAMS CLEANUP
      const teams = await Teams.find({ "members.id": userId });
      for (const team of teams) {
        // Assuming Teams logic similar to Projects or just remove member
        // If specific Owner logic exists for teams, it should be here. 
        // For now, we remove the member. If they are the only one, maybe delete team?
        // Let's safe-fail to removing member.
        await Teams.findByIdAndUpdate(team._id, {
          $pull: { members: { id: userId } }
        });
      }

      // 3. TASKS CLEANUP (Assigned tasks in other projects)
      // Remove user from 'members' array of any Tasks they are assigned to
      await Tasks.updateMany(
        { members: userId },
        { $pull: { members: userId } }
      );

      // 4. DELETE USER
      await User.findByIdAndDelete(userId);

      res.status(200).json("User and all associated data have been deleted.");
    } catch (err) {
      next(err);
    }
  } else {
    return next(createError(403, "You can delete only your account!"));
  }
}

export const findUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

export const getUser = async (req, res, next) => {
  //if the req.user id is not present then it will give a message of user not authenticated 

  try {
    const user = await User.findById(req.user.id).populate("notifications").populate({
      path: "teams",
      populate: {
        path: "members.id",
        select: "_id name email",
      }
    }).populate("projects").populate("works").populate("tasks");
    //extract the notification from the user and send it to the client
    console.log(user)
    res.status(200).json(user);
  } catch (err) {
    console.log(req.user)
    next(err);
  }
}

// get notifications of the user

export const getNotifications = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    //extract the notification from the user and send it to the client
    const notifications = user.notifications;
    const notificationArray = [];
    for (let i = 0; i < notifications.length; i++) {
      const notification = await Notifications.findById(notifications[i]);
      notificationArray.push(notification);
    }
    res.status(200).json(notificationArray);
  } catch (err) {
    next(err);
  }
}



//fetch all the works of the user
export const getWorks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate(
      {
        path: "works",
        populate: {
          path: "tasks",
          populate: {
            path: "members",
            select: "name img",
          },
        }
      }).populate({
        path: "works",
        populate: {
          path: "creatorId",
          select: "name img",
        }
      })
      .sort({ updatedAt: -1 });;
    if (!user) return next(createError(404, "User not found!"));
    //store all the works of the user in an array and send it to the client
    const works = [];
    await Promise.all(
      user.works.map(async (work) => {
        works.push(work);
      })
    ).then(() => {
      res.status(200).json(works);
    });
  } catch (err) {
    next(err);
  }
};

//get all the tasks of the user
export const getTasks = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "tasks",
      populate: {
        path: "members",
        select: "name img",
      }
    }).sort({ end_date: 1 });
    if (!user) return next(createError(404, "User not found!"));
    const tasks = user.tasks.filter(task => task !== null);
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};



export const subscribe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $push: { subscribedUsers: req.params.id },
    });
    await User.findByIdAndUpdate(req.params.id, {
      $inc: { subscribers: 1 },
    });
    res.status(200).json("Subscription successfull.")
  } catch (err) {
    next(err);
  }
}

export const unsubscribe = async (req, res, next) => {
  try {
    try {
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { subscribedUsers: req.params.id },
      });
      await User.findByIdAndUpdate(req.params.id, {
        $inc: { subscribers: -1 },
      });
      res.status(200).json("Unsubscription successfull.")
    } catch (err) {
      next(err);
    }
  } catch (err) {
    next(err);
  }
}

//find project id from user and get it from projects collection and send it to client
export const getUserProjects = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("projects")
    const projects = []
    await Promise.all(user.projects.map(async (project) => {
      await Project.findById(project).populate("members.id", "_id  name email img").then((project) => {
        projects.push(project)
      }).catch((err) => {
        next(err)
      })
    })).then(() => {
      res.status(200).json(projects)
    }).catch((err) => {
      next(err)
    })
  } catch (err) {
    next(err);
  }
}

//find team id from user and get it from teams collection and send it to client
export const getUserTeams = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("teams")
    const teams = []
    await Promise.all(user.teams.map(async (team) => {
      await Teams.findById(team.id).then((team) => {
        teams.push(team)
      }).catch((err) => {
        next(err)
      })
    })).then(() => {
      res.status(200).json(teams)
    }).catch((err) => {
      next(err)
    })
  } catch (err) {
    next(err);
  }
}

//find user from email and send it to client
//find user by email or name
export const findUserByEmail = async (req, res, next) => {
  const query = req.params.email;
  // Escape regex special characters to prevent crashes
  const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  try {
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } },
        {
          $or: [
            { email: { $regex: safeQuery, $options: "i" } },
            { name: { $regex: safeQuery, $options: "i" } }
          ]
        }
      ]
    }).select("name email img").limit(10);

    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}