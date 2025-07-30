// ───────────────────────────────────────────────────────────────
// src/routes/dashboardadmin/client/findClient.ts
// GET /api/dashboardadmin/client/find?q=<term>
// ───────────────────────────────────────────────────────────────
import express, { Request, Response } from "express";
import Client from "@/models/Client";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = express.Router();

/**
 * Find clients by email OR phone (partial, case‑insensitive).
 * Returns up to 20 matches (only _id, username, phone, email — no password).
 */
router.get(
  "/find",
  requirePermission("M_Access"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const q = String(req.query.q || "").trim();
      if (q.length < 2) {
        res
          .status(400)
          .json({ message: "Query param 'q' must be at least 2 characters." });
        return;
      }

      // create a safe, case‑insensitive RegExp
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      const clients = await Client.find({
        $or: [{ email: rx }, { phone: rx }],
      })
        .select("username phone email")          // ← no password
        .limit(20)
        .sort({ createdAt: -1 })
        .lean();

      res.status(200).json({ clients });
    } catch (error) {
      console.error("Find‑Client error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
