/* ------------------------------------------------------------------
   src/routes/stock/getBoutiques.ts
   GET /api/stock/boutiques
   Liste publique (mais protégée) des boutiques approuvées
------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import Boutique from "@/models/stock/Boutique";
import { requirePermission } from "@/middleware/requireDashboardPermission"; 
const router = Router();

/**
 * GET /api/stock/boutiques
 * Permissions : M_Stock
 * Renvoie les boutiques où vadmin === "approve" avec :
 *   - _id
 *   - name
 *   - phoneNumber? (facultatif)
 *   - address?     (facultatif)
 *   - city?        (facultatif)
 */
router.get(
  "/approved",
  requirePermission("M_Stock"),                // ⇦ AJOUTÉ
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const boutiques = await Boutique.find({ vadmin: "approve" })
        .select("_id name phoneNumber address city")
        .sort({ name: 1 })
        .lean();

      res.json({ boutiques });
    } catch (err) {
      console.error("Get Boutiques Error:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

export default router;
