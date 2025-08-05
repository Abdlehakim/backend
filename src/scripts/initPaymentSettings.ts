// src/scripts/initPaymentSettings.ts

import PaymentMethod from "@/models/payment/PaymentMethods";
import {
  PAYMENT_METHOD_KEYS,
  EMPTY_METHOD_CFG,
  PaymentMethodKey,
} from "@/constants/paymentSettingsData";

/** Seed the PaymentMethod collection with one doc per method */
export default async function initPaymentSettings(): Promise<void> {
  for (const key of PAYMENT_METHOD_KEYS) {
    const exists = await PaymentMethod.findOne({ name: key });

    if (!exists) {
      await PaymentMethod.create({
        name: key,
        ...EMPTY_METHOD_CFG,
      });

      console.log(`✅ PaymentMethod "${key}" created`);
    }
  }

  console.log("✅ All payment methods initialized.");
}
