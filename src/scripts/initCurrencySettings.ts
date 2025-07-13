import CurrencySettings from "@/models/checkout/CurrencySettings";

/**
 * Ensure the singleton CurrencySettings document exists.
 * Seeds it with primary="TND" and an empty secondaries array.
 *
 * Call this once at server start-up (just like initPaymentSettings).
 */
export default async function initCurrencySettings() {
  let doc = await CurrencySettings.findOne(); // returns null if missing
  if (!doc) {
    doc = await CurrencySettings.create({
      primary: "TND",
      secondaries: [],
    });
    console.log("✅ CurrencySettings seeded (primary=TND, no secondaries)");
  }
  return doc;
}
