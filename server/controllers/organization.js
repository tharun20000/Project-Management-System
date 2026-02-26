import Organization from "../models/Organization.js";
import User from "../models/User.js";
import { createError } from "../error.js";

import Role from "../models/Role.js";
import { seedDefaultRoles } from "./role.js";

export const createOrganization = async (req, res, next) => {
    try {
        const { name, description, img } = req.body;
        const userId = req.user.id; // From verifyToken middleware

        const newOrg = new Organization({
            name,
            description,
            img,
            owner: userId,
            members: [] // Will add after seeding roles
        });

        // Save first to get ID
        const savedOrg = await newOrg.save();

        // Seed roles
        const roles = await seedDefaultRoles(savedOrg._id);
        const ownerRole = roles.find(r => r.name === "Owner");

        // Add creator as Owner
        savedOrg.members.push({ user: userId, role: ownerRole._id });
        await savedOrg.save();

        // Add org to user's list and set as current
        await User.findByIdAndUpdate(userId, {
            $push: { organizations: savedOrg._id },
            $set: { currentOrganization: savedOrg._id }
        });

        res.status(201).json(savedOrg);
    } catch (err) {
        next(err);
    }
};

export const getOrganizations = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate("organizations");
        res.status(200).json(user.organizations);
    } catch (err) {
        next(err);
    }
};

export const switchOrganization = async (req, res, next) => {
    try {
        const { orgId } = req.body;
        const userId = req.user.id;

        // Verify user is member of this org
        const org = await Organization.findById(orgId);
        if (!org) return next(createError(404, "Organization not found"));

        const isMember = org.members.some(m => m.user.toString() === userId);
        if (!isMember) return next(createError(403, "You are not a member of this organization"));

        const user = await User.findByIdAndUpdate(userId, {
            $set: { currentOrganization: orgId }
        }, { new: true }).populate("currentOrganization");

        res.status(200).json(user);
    } catch (err) {
        next(err);
    }
};

export const inviteUser = async (req, res, next) => {
    try {
        const { email, roleId } = req.body;
        const { id } = req.params; // Org ID
        const requesterId = req.user.id;

        const org = await Organization.findById(id).populate({
            path: 'members.role',
            model: 'Role'
        });
        if (!org) return next(createError(404, "Organization not found"));

        // Check requester permissions
        const requesterMember = org.members.find(m => m.user.toString() === requesterId);
        if (!requesterMember) return next(createError(403, "You are not a member of this organization"));

        const requesterRole = requesterMember.role; // This is now a populated Role document
        if (!requesterRole.permissions.includes("org.invite") && requesterRole.name !== "Owner") {
            return next(createError(403, "You do not have permission to invite members"));
        }

        const userToInvite = await User.findOne({ email });
        if (!userToInvite) return next(createError(404, "User not found"));

        // Check if already member
        if (org.members.some(m => m.user.toString() === userToInvite._id.toString())) {
            return next(createError(400, "User is already a member"));
        }

        // Validate role being assigned
        // If no roleId provided, find default "Member" role
        let assignedRole;
        if (roleId) {
            assignedRole = await Role.findOne({ _id: roleId, organizationId: id });
        } else {
            assignedRole = await Role.findOne({ name: "Member", organizationId: id });
        }

        if (!assignedRole) return next(createError(400, "Invalid role specified"));

        // Add to org
        // Note: we can't push directly to a populated array if we want to save, 
        // but mongoose handles ID pushing to Ref arrays usually. 
        // Safest is to refetch or use updateOne.
        // Let's use updateOne to be safe and efficient.

        await Organization.updateOne(
            { _id: id },
            { $push: { members: { user: userToInvite._id, role: assignedRole._id } } }
        );

        // Add org to user list
        await User.findByIdAndUpdate(userToInvite._id, {
            $push: { organizations: org._id }
        });

        res.status(200).json({ message: "User invited successfully" });
    } catch (err) {
        next(err);
    }
};
