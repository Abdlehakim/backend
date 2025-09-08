/* ------------------------------------------------------------------
   src/routes/dashboardadmin/factures/deleteFactures.ts
   POST /api/dashboardadmin/factures/delete
   Body: { ids: string[] }  // bulk delete by ids
------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import Facture from "@/models/Facture";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

/* Small helpers */
const isValidId = (s: string) => Types.ObjectId.isValid(s);

router.post(
  "/delete",
  // If you have a stricter permission for destructive actions, change to e.g. "M_Delete"
  requirePermission("M_Access"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const ids = (req.body?.ids ?? []) as unknown;

      if (!Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ message: "Provide non-empty 'ids' array." });
        return;
      }

      // sanitize + dedupe
      const unique = Array.from(new Set(ids.map(String)));
      const invalidIds: string[] = unique.filter((id) => !isValidId(id));
      const candidateIds = unique.filter((id) => isValidId(id));

      if (candidateIds.length === 0) {
        res.status(400).json({
          message: "No valid ObjectIds found in 'ids'.",
          invalidIds,
        });
        return;
      }

      // find existing (lets us report 'notFound')
      const existing = await Facture.find({
        _id: { $in: candidateIds },
      })
        .select("_id")
        .lean();

      const existingIdStrs = new Set(existing.map((d) => d._id.toString()));
      const notFoundIds = candidateIds.filter((id) => !existingIdStrs.has(id));

      // perform deletion on existing
      const toDelete = Array.from(existingIdStrs);
      const delRes = await Facture.deleteMany({
        _id: { $in: toDelete },
      });

      res.status(200).json({
        ok: true,
        requested: unique.length,
        deleted: delRes.deletedCount ?? 0,
        invalidIds,
        notFoundIds,
      });
    } catch (err) {
      console.error("[deleteFactures] error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

export default router;
