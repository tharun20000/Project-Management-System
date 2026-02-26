import express from "express";
import { createRole, getRoles, updateRole, deleteRole } from "../controllers/role.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Role management usually requires 'role.manage' permission
// For now we attach verifyToken. In controllers we check logical permissions.

router.get("/:orgId", verifyToken, getRoles);
router.post("/:orgId", verifyToken, createRole);
router.put("/:roleId", verifyToken, updateRole);
router.delete("/:roleId", verifyToken, deleteRole);

export default router;
