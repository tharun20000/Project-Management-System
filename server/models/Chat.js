import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
    {
        members: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
        },
        isGroupChat: { type: Boolean, default: false },
        groupName: { type: String, default: "" },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Chat", ChatSchema);
