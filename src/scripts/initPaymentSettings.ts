import PaymentSettings from "@/models/checkout/PaymentSettings";

/** Ensure the one-and-only PaymentSettings document exists. */
export default async function initPaymentSettings() {
  let doc = await PaymentSettings.findOne();
  if (!doc) {
    doc = await PaymentSettings.create({
      paypal: false,
      stripe: false,
      cashOnDelivery: false,
    });
    console.log("✅  PaymentSettings seeded with all methods OFF");
  }
  return doc;
}
