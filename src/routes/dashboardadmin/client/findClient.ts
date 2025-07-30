/* ------------------------------------------------------------------
   GET /api/dashboardadmin/client/find?q=<term>
   Recherche simultanée dans Client + ClientShop
------------------------------------------------------------------ */
import { Router, Request, Response } from "express";
import Client from "@/models/Client";
import ClientShop from "@/models/ClientShop";
import { requirePermission } from "@/middleware/requireDashboardPermission";

const router = Router();

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

      /** Escape any regex‑special chars to keep search safe */
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

      /* ---------- parallel queries ---------- */
      const [accounts, shops] = await Promise.all([
        Client.find({ $or: [{ email: rx }, { phone: rx }] })
          .select("username phone email")   // pas de password
          .limit(20)
          .lean(),

        ClientShop.find({ $or: [{ name: rx }, { phone: rx }] })
          .select("name phone email")
          .limit(20)
          .lean(),
      ]);

      /* ---------- merge & normalise ---------- */
      const clients = [
        ...accounts.map((c) => ({
          _id: c._id,
          name: c.username ?? "—",
          phone: c.phone,
          email: c.email,
          origin: "account" as const,
        })),
        ...shops.map((s) => ({
          _id: s._id,
          name: s.name,
          phone: s.phone,
          email: s.email,
          origin: "shop" as const,
        })),
      ];

      res.status(200).json({ clients });
    } catch (error) {
      console.error("Find‑Client error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
