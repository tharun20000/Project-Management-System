import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    img: {
        type: String,
        default: "",
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    members: [{
        _id: false,
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        role: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role",
            required: true,
        },
        joinedAt: {
            type: Date,
            default: Date.now,
        }
    }],
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teams",
    }],
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
    }],
    billing: {
        email: { type: String },
        plan: { type: String, default: "Free" },
        status: { type: String, default: "Active" }
    }
}, { timestamps: true });

export default mongoose.model("Organization", OrganizationSchema);
