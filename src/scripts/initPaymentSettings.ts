import PaymentSettings from "@/models/payment/PaymentSettings";

/** Ensure the one-and-only PaymentSettings document exists. */
export default async function initPaymentSettings() {
  let doc = await PaymentSettings.findOne();
  if (!doc) {
    doc = await PaymentSettings.create({
      paypal: {
        enabled: false,
        label:   "",
        help:    "",
      },
      stripe: {
        enabled: false,
        label:   "",
        help:    "",
      },
      cashOnDelivery: {
        enabled: false,
        label:   "",
        help:    "",
      },
    });

    console.log("✅  PaymentSettings seeded (all methods OFF, labels empty)");
  }
  return doc;
}
