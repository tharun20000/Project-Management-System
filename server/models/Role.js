import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
        required: true,
    },
    permissions: {
        type: [String], // e.g., ["project.create", "task.delete"]
        default: [],
    },
    isSystem: {
        type: Boolean,
        default: false, // System roles cannot be deleted (e.g., Owner)
    },
    description: {
        type: String,
        default: "",
    }
}, { timestamps: true });

// Ensure role names are unique within an organization
RoleSchema.index({ name: 1, organizationId: 1 }, { unique: true });

export default mongoose.model("Role", RoleSchema);
