import mongoose, { Mongoose } from "mongoose";

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: false,
    },
    desc: {
        type: String,
        required: true,
        unique: false,
    },
    img: {
        type: String,
        default: "",
        unique: false,
    },
    tools: {
        type: [{
            _id: false,
            link: {
                type: String,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            icon: {
                type: String,
                required: true,
            }
        }],
        default: [],
    },
    members: {
        type: [{
            _id: false,
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            role: {
                type: String,
                required: true,
            },
            access: {
                type: String,
                required: true,
                default: "View Only",
                unique: false,
            }
        }],
        required: true,
        default: [],
    },
    projects: {
        type: [mongoose.Schema.Types.ObjectId],
        default: [],
        ref: "Project",
    },
    polls: {
        type: [{
            question: { type: String, required: true },
            options: [{
                text: { type: String, required: true },
                votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
            }],
            createdAt: { type: Date, default: Date.now }
        }],
        default: []
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization"
    }
},
    { timestamps: true }
);

export default mongoose.model("Teams", TeamSchema);