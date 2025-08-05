// src/constants/paymentSettingsData.ts

/** All available payment‐settings keys, in the order you want to render them */
export const PAYMENT_METHOD_KEYS = [
  "paypal",
  "stripe",
  "cashOnDelivery",
  "payInMagasin",
] as const;

/** Type covering any one payment‐method key */
export type PaymentMethodKey = typeof PAYMENT_METHOD_KEYS[number];

/** Helper: build an empty MethodCfg for initializing or seeding */
export const EMPTY_METHOD_CFG = {
  enabled: false,
  label:   "",
  help:    "",
} as const;
