// backend/src/routes/pdf/invoicePdf.ts
import { Router, type RequestHandler } from "express";
import puppeteer from "puppeteer"; // or 'puppeteer-core' if you ship system Chromium
import { Types } from "mongoose";
import Order from "@/models/Order";
import Client, { IClient } from "@/models/Client";
import CompanyData, { ICompanyData } from "@/models/websitedata/companyData";
import {
  renderInvoiceHtml,
  type OrderDoc,
  type PdfOptions,
  type PdfClient,
} from "@/templates/pdf/invoiceTemplate";

const router = Router();

/* ----------------------------- helpers ----------------------------- */

function acceptsPdf(req: any) {
  const a = String(req.get("accept") || "");
  return /application\/pdf/i.test(a);
}

/** Convert a remote image to a data URL (helps Puppeteer always render it). */
async function toDataUrl(url: string): Promise<string | null> {
  try {
    if (!url) return null;
    if (/^data:/i.test(url)) return url;
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const mime = res.headers.get("content-type") || "image/png";
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Coerce a raw DB order into the minimal shape the template expects */
function toOrderDoc(raw: any): OrderDoc {
  return {
    ref: String(raw?.ref ?? ""),
    DeliveryAddress: Array.isArray(raw?.DeliveryAddress) ? raw.DeliveryAddress : [],
    pickupMagasin: Array.isArray(raw?.pickupMagasin) ? raw.pickupMagasin : [],
    orderItems: Array.isArray(raw?.orderItems) ? raw.orderItems : [],
    deliveryMethod: Array.isArray(raw?.deliveryMethod) ? raw.deliveryMethod : undefined,
    paymentMethod: Array.isArray(raw?.paymentMethod) ? raw.paymentMethod : undefined,
    deliveryMethodLegacy: raw?.deliveryMethodLegacy ?? undefined,
    paymentMethodLegacy: raw?.paymentMethodLegacy ?? undefined,
    deliveryCostLegacy:
      typeof raw?.deliveryCostLegacy === "number" ? raw.deliveryCostLegacy : undefined,
    expectedDeliveryDate: raw?.expectedDeliveryDate ?? undefined,
    orderStatus: String(raw?.orderStatus ?? ""),
    createdAt: raw?.createdAt ?? new Date().toISOString(),
  };
}

/** Resolve a Client doc ID from order.client (ObjectId | populated object | string) */
function extractClientId(rawClient: any): string | null {
  if (!rawClient) return null;
  if (Types.ObjectId.isValid(rawClient) && String(rawClient) === String(new Types.ObjectId(rawClient))) {
    return String(rawClient);
  }
  if (rawClient?._id && Types.ObjectId.isValid(rawClient._id)) {
    return String(rawClient._id);
  }
  if (typeof rawClient === "string" && Types.ObjectId.isValid(rawClient)) {
    return rawClient;
  }
  return null;
}

/** Build the PdfClient block from the order snapshot + live Client doc (if found) */
async function buildClientFromOrder(rawOrder: any): Promise<PdfClient> {
  const deliveryAddr: string = rawOrder?.DeliveryAddress?.[0]?.DeliverToAddress || "";
  let block: PdfClient = {
    name: rawOrder?.clientName || "Client",
    address: deliveryAddr,
    vat: "",
    phone: "",
    email: "",
  };

  const clientId = extractClientId(rawOrder?.client);
  if (clientId) {
    try {
      const clientDoc = await Client.findById(clientId).lean<IClient | null>();
      if (clientDoc) {
        block = {
          ...block,
          name: block.name || clientDoc.username || clientDoc.email,
          phone: clientDoc.phone || block.phone || "",
          email: clientDoc.email || block.email || "",
        };
      }
    } catch (e) {
      console.warn("Client lookup failed:", e);
    }
  }
  return block;
}

/** Launch Chromium in a prod-safe way */
async function launchBrowser() {
  const execPath =
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    process.env.CHROMIUM_PATH || // if you installed system chromium
    undefined;

  return puppeteer.launch({
    headless: true, // keep boolean for widest type compatibility
    executablePath: execPath, // undefined => bundled Chromium
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--font-render-hinting=medium",
    ],
  });
}

/* ----------------------------- route ----------------------------- */

const getInvoicePdf: RequestHandler = async (req, res) => {
  const debug = req.query.debug === "1" || !acceptsPdf(req);
  let browser: puppeteer.Browser | null = null;

  try {
    const { ref } = req.params as { ref: string };

    // 1) Load order
    const rawOrder = await Order.findOne({ ref }).lean();
    if (!rawOrder) {
      const payload = { error: "Order not found", ref };
      if (debug) {
        res.status(404).json(payload);
      } else {
        res.status(404).end();
      }
      return; // <-- ensure void
    }
    const order = toOrderDoc(rawOrder);

    // 2) Build client block
    const client: PdfClient = await buildClientFromOrder(rawOrder);

    // 3) Load company data and inline logo (best effort)
    const company = await CompanyData.findOne().lean<ICompanyData | null>();
    let logoSrc = company?.logoImageUrl || "";
    if (logoSrc) {
      const inline = await toDataUrl(logoSrc);
      if (inline) logoSrc = inline;
    }

    // 4) Template options
    const opts: PdfOptions = {
      currency: "TND",
      docType: "facture",
      number: String(order.ref || "").replace(/^ORDER-/, ""),
      date: new Date(order.createdAt as any).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      pricesAreTTC: true,
      company: company
        ? {
            name: company.name,
            vat: company.vat,
            address: [company.address, company.city, company.zipcode, company.governorate]
              .filter(Boolean)
              .join(", "),
            phone: company.phone,
            email: company.email,
            logo: logoSrc,
          }
        : undefined,
      client,
    };

    // 5) Render HTML/CSS
    let html: string, css: string;
    try {
      const out = renderInvoiceHtml(order, opts);
      html = out.html;
      css = out.css;
    } catch (e: any) {
      const payload = { error: "Template render failed", message: e?.message || String(e) };
      if (debug) {
        res.status(500).json(payload);
      } else {
        res.status(500).end();
      }
      return;
    }

    // 6) Generate PDF
    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1240, height: 1754, deviceScaleFactor: 1 });
    await page.setContent(
      `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${html}</body></html>`,
      { waitUntil: "networkidle0", timeout: 60_000 }
    );
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "10mm", right: "10mm", bottom: "12mm", left: "10mm" },
    });
    await page.close();

    // 7) Respond
    if (debug) {
      res.status(200).json({
        ok: true,
        bytes: pdf.length,
        ref,
        note: "Remove ?debug=1 or set Accept: application/pdf to download the file.",
      });
      return;
    }

    const filename = `FACTURE-${opts.number || "invoice"}.pdf`;
    res
      .status(200)
      .setHeader("Content-Type", "application/pdf")
      .setHeader("Content-Disposition", `attachment; filename="${filename}"`)
      .setHeader("Cache-Control", "no-store, no-cache, must-revalidate")
      .setHeader("Pragma", "no-cache")
      .setHeader("Expires", "0")
      .setHeader("Content-Length", String(pdf.length))
      .end(pdf);
    return;
  } catch (err: any) {
    console.error("[invoicePdf] Failed:", err?.message || err);
    res.status(500).json({
      error: "Failed to generate PDF",
      message: err?.message || String(err),
    });
    return;
  } finally {
    try {
      await browser?.close();
    } catch {}
  }
};

router.get("/invoice/:ref", getInvoicePdf);

// Export both ways so TS treats this as a module and imports are flexible
export const invoicePdfRouter = router;
export default router;
