import express from "express";
import { addProject, deleteProject, getProject, updateProject, updateProjectStages, removeMember, inviteProjectMember, verifyInvitation, getProjectMembers, addWork, getWorks, updateMembers, updateTaskStatus, updateWorkStatus, deleteTask, deleteWork, addNewTask, updateTask, startTimer, stopTimer, getWorkloadStats, createSnapshot, getSnapshots, getGitHubActivity, warpDriveProject } from "../controllers/project.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { localVariables } from "../middleware/auth.js";

const router = express.Router();

//create a project
router.post("/", verifyToken, addProject);
//warp drive project
router.post("/warp-drive", verifyToken, warpDriveProject);
//get workload stats
router.get("/get/workload", verifyToken, getWorkloadStats);
//get all projects
router.get("/:id", verifyToken, getProject)
//delete a project
router.delete("/:id", verifyToken, deleteProject)
//update a project
router.patch("/:id", verifyToken, updateProject)
//update project stages
router.patch("/:id/stages", verifyToken, updateProjectStages)
//update a project member
router.patch("/member/:id", verifyToken, updateMembers)
//remove a project member
router.patch("/member/remove/:id", verifyToken, removeMember)

//invite a  project
router.post("/invite/:id", verifyToken, localVariables, inviteProjectMember)
//verify a invite
router.get("/invite/:code", verifyInvitation)
//get  members
router.get("/members/:id", verifyToken, getProjectMembers)

//works
// add works to a project
router.post("/works/:id", verifyToken, addWork)
//get all works of a project
router.get("/works/:id", verifyToken, getWorks)
//add task to work
router.post("/work/:workId/task", verifyToken, addNewTask)

//update task status
router.patch("/task/:taskId", verifyToken, updateTaskStatus)
//update task details
router.patch("/task/update/:taskId", verifyToken, updateTask)
//delete task
router.delete("/task/:taskId", verifyToken, deleteTask)
//update work status
router.patch("/work/:workId", verifyToken, updateWorkStatus)
//delete work
router.delete("/work/:workId", verifyToken, deleteWork)

//timer
router.post("/task/:taskId/start-timer", verifyToken, startTimer)
router.post("/task/:taskId/stop-timer", verifyToken, stopTimer)

// snapshots
router.post("/:id/snapshot", verifyToken, createSnapshot)
router.get("/:id/snapshots", verifyToken, getSnapshots)


// github
router.get("/:id/github", verifyToken, getGitHubActivity)

export default router;