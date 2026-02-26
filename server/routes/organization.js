import express from "express";
import { createOrganization, getOrganizations, switchOrganization, inviteUser } from "../controllers/organization.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createOrganization);
router.get("/", verifyToken, getOrganizations);
router.put("/switch", verifyToken, switchOrganization);
router.post("/:id/invite", verifyToken, inviteUser);

export default router;
