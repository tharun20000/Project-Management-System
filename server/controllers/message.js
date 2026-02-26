import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

export const addMessage = async (req, res, next) => {
    const { chatId, text } = req.body;
    const senderId = req.user.id; // Secure senderId

    const message = new Message({
        chatId,
        senderId,
        text,
    });

    try {
        const result = await message.save();

        // Emit to chat room
        const io = req.app.get("io");
        io.to(chatId).emit("msg-recieve", result);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getMessages = async (req, res, next) => {
    const { chatId } = req.params;
    try {
        const result = await Message.find({ chatId });
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
