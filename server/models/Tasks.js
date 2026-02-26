import mongoose from "mongoose";

const TasksSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Projects",
        required: true,
        unique: false,
    },
    workId: { type: String, unique: false },
    task: { type: String, required: true },
    start_date: { type: String, required: true, default: "" },
    end_date: { type: String, required: true, default: "" },
    members: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: [],
    },
    status: { type: String, default: "Working" },
    time_tracked: { type: Number, default: 0 },
    active_session: {
        start_time: { type: Date, default: null },
        is_active: { type: Boolean, default: false }
    },
    impact_risk: { type: String, enum: ["Low", "Medium", "High", "Unknown"], default: "Unknown" },
    impact_modules: { type: [String], default: [] },
    impact_notes: { type: String, default: "Impact analysis pending..." },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: false
    }
},
    { timestamps: true }
);

export default mongoose.model("Tasks", TasksSchema);