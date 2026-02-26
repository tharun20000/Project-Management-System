import mongoose from "mongoose";

const ProjectSnapshotSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    message: {
        type: String,
        required: true,
        default: "Project snapshot" // commit message
    },
    snapshotData: {
        type: mongoose.Schema.Types.Mixed, // Stores the complete state of project, works, tasks at that point
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

export default mongoose.model("ProjectSnapshot", ProjectSnapshotSchema);
