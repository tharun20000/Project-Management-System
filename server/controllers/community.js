import Post from "../models/Post.js";
import { createError } from "../error.js";

export const createPost = async (req, res, next) => {
    const newPost = new Post({ ...req.body, userId: req.user.id });
    try {
        const savedPost = await newPost.save();
        res.status(200).json(savedPost);
    } catch (err) {
        next(err);
    }
};

export const getPosts = async (req, res, next) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        next(err);
    }
};

export const likePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.user.id)) {
            await post.updateOne({ $push: { likes: req.user.id } });
            res.status(200).json("The post has been liked");
        } else {
            await post.updateOne({ $pull: { likes: req.user.id } });
            res.status(200).json("The post has been disliked");
        }
    } catch (err) {
        next(err);
    }
}

export const deletePost = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.user.id) {
            await post.deleteOne();
            res.status(200).json("The post has been deleted");
        } else {
            return next(createError(403, "You can delete only your post!"));
        }
    } catch (err) {
        next(err);
    }
};
