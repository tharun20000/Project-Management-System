import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { createPost, deletePost, getPosts, likePost } from "../controllers/community.js";

const router = express.Router();

//create a post
router.post("/", verifyToken, createPost);

//get all posts
router.get("/", verifyToken, getPosts);

//like a post
router.put("/like/:id", verifyToken, likePost);

//delete a post
router.delete("/:id", verifyToken, deletePost);

export default router;
