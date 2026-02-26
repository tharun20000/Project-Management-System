import Organization from "../models/Organization.js";
import Role from "../models/Role.js";
import { createError } from "../error.js";

// Helper to define default roles
const DEFAULT_ROLES = [
    {
        name: "Owner",
        permissions: [
            "org.update", "org.delete", "org.invite", "org.remove",
            "project.create", "project.delete", "project.update", "project.view",
            "task.create", "task.delete", "task.update", "task.view",
            "gantt.view",
            "role.manage"
        ],
        isSystem: true,
        description: "Full control over the organization"
    },
    {
        name: "Admin",
        permissions: [
            "org.invite",
            "project.create", "project.delete", "project.update", "project.view",
            "task.create", "task.delete", "task.update", "task.view",
            "gantt.view"
        ],
        isSystem: true,
        description: "Manage projects and members"
    },
    {
        name: "Member",
        permissions: [
            "project.view",
            "task.create", "task.update", "task.view",
            "gantt.view"
        ],
        isSystem: true, // Default role
        description: "Regular member"
    }
];

export const createRole = async (req, res, next) => {
    try {
        const { name, permissions, description } = req.body;
        const { orgId } = req.params;

        // Check permissions (assuming verification middleware passes orgId)
        // Only verify organization existence here if needed
        const existingRole = await Role.findOne({ name, organizationId: orgId });
        if (existingRole) return next(createError(400, "Role with this name already exists"));

        const newRole = new Role({
            name,
            permissions,
            description,
            organizationId: orgId
        });

        const savedRole = await newRole.save();
        res.status(201).json(savedRole);
    } catch (err) {
        next(err);
    }
};

export const getRoles = async (req, res, next) => {
    try {
        const { orgId } = req.params;
        const roles = await Role.find({ organizationId: orgId });
        res.status(200).json(roles);
    } catch (err) {
        next(err);
    }
};

export const updateRole = async (req, res, next) => {
    try {
        const { roleId } = req.params;
        const { permissions, description } = req.body;

        const role = await Role.findById(roleId);
        if (!role) return next(createError(404, "Role not found"));

        if (role.isSystem) {
            // System roles permissions might be locked, but let's allow updating permissions for now except for maybe deletion
            // Or restrict updating system names
        }

        const updatedRole = await Role.findByIdAndUpdate(
            roleId,
            { permissions, description },
            { new: true }
        );
        res.status(200).json(updatedRole);
    } catch (err) {
        next(err);
    }
};

export const deleteRole = async (req, res, next) => {
    try {
        const { roleId } = req.params;
        const role = await Role.findById(roleId);

        if (!role) return next(createError(404, "Role not found"));
        if (role.isSystem) return next(createError(403, "Cannot delete system roles"));

        // Check if any members are assigned this role
        const org = await Organization.findById(role.organizationId);
        const isAssigned = org.members.some(m => m.role.toString() === roleId);

        if (isAssigned) return next(createError(400, "Cannot delete role assigned to members. Reassign them first."));

        await Role.findByIdAndDelete(roleId);
        res.status(200).json("Role has been deleted");
    } catch (err) {
        next(err);
    }
};

// Internal function to seed roles
export const seedDefaultRoles = async (orgId) => {
    const roles = await Promise.all(DEFAULT_ROLES.map(role => {
        return new Role({ ...role, organizationId: orgId }).save();
    }));
    return roles; // Returns array of Role documents
};
