/* ------------------------------------------------------------------
   src/routes/dashboardadmin/client-company/getAllClientCompany.ts
   Route : récupérer la liste complète des « ClientCompany »
------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import ClientCompany from "@/models/ClientCompany";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

/**
 * GET /api/dashboardadmin/clientCompany
 * Renvoie tous les ClientCompany (triés par création desc.)
 */
router.get(
  "/",
  requirePermission("M_Access"),
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const companies = await ClientCompany.find().sort({ createdAt: -1 });
      res.status(200).json({ companies });
    } catch (error) {
      console.error("GetAll ClientCompany Error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
