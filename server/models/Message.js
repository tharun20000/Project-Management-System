import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat",
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        text: {
            type: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);
