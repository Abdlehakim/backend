// ───────────────────────────────────────────────────────────────
// src/routes/website/checkout/getAllDeliveryOption.ts
// Public endpoint – returns active delivery methods for checkout
// ───────────────────────────────────────────────────────────────
import { Router, Request, Response } from "express";
import DeliveryOption from "@/models/dashboardadmin/DeliveryOption";

const router = Router();

/* ================================================================== */
/*  GET /api/checkout/delivery-options                                 */
/*     ?limit=6          – optional, defaults to all                   */
/* ================================================================== */
router.get("/", async (req: Request, res: Response) => {
  try {
    
    const options = await DeliveryOption.find({ isActive: true })
      .select("_id name description price")
      .sort({ price: 1 })            
      .lean();

    /* map to the shape your frontend expects */
    const result = options.map((o) => ({
      id:    o._id.toString(),
      name:  o.name,
      description: o.description ?? "",
      cost:  o.price,
    }));

    res.json(result);
  } catch (err) {
    console.error("Error fetching delivery options:", err);
    res.status(500).json({ error: "Error fetching delivery options" });
  }
});

export default router;
