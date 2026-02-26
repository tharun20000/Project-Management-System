import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        img: {
            type: String,
        },
        desc: {
            type: String,
            required: true,
        },
        imgUrl: {
            type: String,
        },
        likes: {
            type: [String],
            default: [],
        },
        comments: {
            type: [String],
            default: [],
        },
    },
    { timestamps: true }
);

export default mongoose.model("Post", PostSchema);
