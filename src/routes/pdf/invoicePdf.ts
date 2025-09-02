// backend/src/routes/pdf/invoicePdf.ts
import { Router, type RequestHandler } from "express";
import puppeteer, { type Browser } from "puppeteer";
import fs from "node:fs";
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

/* --------------------- Chrome executable resolution --------------------- */

function pathExists(p?: string | null) {
  if (!p) return false;
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

/** Resolve a working Chrome/Chromium path:
 *  1) Env vars (PUPPETEER_EXECUTABLE_PATH / CHROMIUM_PATH / GOOGLE_CHROME_BIN)
 *  2) Common system paths (apt-installed)
 *  3) Puppeteer-managed cache (requires `puppeteer browsers install chrome`)
 */
function resolveExecPath(): string {
  const envCandidates = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROMIUM_PATH,
    process.env.GOOGLE_CHROME_BIN,
  ].filter(Boolean) as string[];
  for (const p of envCandidates) if (pathExists(p)) return p;

  const systemCandidates = [
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/google-chrome",
    "/opt/google/chrome/chrome",
  ];
  for (const p of systemCandidates) if (pathExists(p)) return p;

  try {
    const p = puppeteer.executablePath();
    if (pathExists(p)) return p;
  } catch {}

  throw new Error(
    "No Chrome executable found. " +
      "Either set PUPPETEER_EXECUTABLE_PATH (apt-installed Chromium) " +
      "or run 'puppeteer browsers install chrome' during build."
  );
}

/** Launch Chromium in a prod-safe way using the resolved executable path */
async function launchBrowser(): Promise<Browser> {
  const executablePath = resolveExecPath();
  console.log("[PDF] Using Chrome at:", executablePath);

  return puppeteer.launch({
    headless: true,
    executablePath,
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
  let browser: Browser | null = null;

  try {
    const { ref } = req.params as { ref: string };

    const rawOrder = await Order.findOne({ ref }).lean();
    if (!rawOrder) {
      const payload = { error: "Order not found", ref };
      if (debug) res.status(404).json(payload);
      else res.status(404).end();
      return;
    }
    const order = toOrderDoc(rawOrder);

    const client: PdfClient = await buildClientFromOrder(rawOrder);

    const company = await CompanyData.findOne().lean<ICompanyData | null>();
    let logoSrc = company?.logoImageUrl || "";
    if (logoSrc) {
      const inline = await toDataUrl(logoSrc);
      if (inline) logoSrc = inline;
    }

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

    let html: string, css: string;
    try {
      const out = renderInvoiceHtml(order, opts);
      html = out.html;
      css = out.css;
    } catch (e: any) {
      const payload = { error: "Template render failed", message: e?.message || String(e) };
      if (debug) res.status(500).json(payload);
      else res.status(500).end();
      return;
    }

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
export const invoicePdfRouter = router;
export default router;
