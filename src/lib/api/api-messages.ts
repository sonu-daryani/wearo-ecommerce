/**
 * Single source of truth for user-facing API copy. Import only on the server in route handlers
 * (and re-expose subsets via GET /api/messages for client-side validation that runs before POST).
 */
export const API_MESSAGES = {
  COMMON: {
    INVALID_JSON: "Invalid request body.",
    INTERNAL_ERROR: "Something went wrong. Please try again.",
    NETWORK_UNAVAILABLE: "Network unavailable. Check your connection and try again.",
  },

  ORDERS: {
    MISSING_SHIPPING: "Please fill in all required shipping fields.",
    INVALID_PAYMENT_METHOD: "Invalid payment method.",
    NO_ITEMS: "Your cart has no items to order.",
    COD_UNAVAILABLE: "Cash on delivery is not available for this store.",
    ONLINE_UNAVAILABLE: "Online payment is not available for this store.",
    TOTALS_MISMATCH: "Totals do not match. Refresh the page and try again.",
    NO_PROVIDER_CONFIGURED: "No payment provider is configured.",
    PLACE_FAILED: "Could not create your order. Please try again.",
    PLACED: "Order placed successfully.",
    LOADED: "Order loaded.",
    MISSING_TOKEN: "Missing order reference.",
    NOT_FOUND: "We could not find that order.",
  },

  PAYMENTS: {
    MISSING_PUBLIC_TOKEN: "Missing order token.",
    SESSION_READY: "Payment session is ready.",
    VERIFY_SUCCESS: "Payment confirmed.",
    VERIFY_FAILED_GENERIC:
      "We could not confirm payment. If you were charged, contact support with your order details.",
    LEGACY_CONFIRM_DISABLED:
      "Client payment confirmation is disabled. Use a verified webhook or the payments API.",
    LEGACY_CONFIRM_OK: "Payment marked as received.",
  },

  AUTH: {
    REGISTER_INVALID: "Enter a valid email and a password of at least 8 characters.",
    REGISTER_EXISTS: "An account with this email already exists.",
    REGISTER_SUCCESS: "Account created. You can sign in.",
  },

  /** Included on GET /api/company-settings for checkout copy (no duplicate strings in components). */
  CHECKOUT_UI: {
    CART_EMPTY: "Your cart is empty.",
    NO_PAYMENT_METHOD:
      "No payment method is available. Ask the store to enable payments in admin.",
    CHOOSE_PROVIDER: "Choose a payment provider.",
    PROVIDER_NOT_READY:
      "This provider is not fully configured in Admin → Payment settings.",
    PROVIDER_NOT_READY_STRIPE:
      "Stripe: add the publishable key and secret key in Admin → Payment settings.",
    PROVIDER_NOT_READY_RAZORPAY:
      "Razorpay: add the Key ID and Key Secret in Admin → Payment settings.",
    PROVIDER_NOT_READY_CASHFREE:
      "Cashfree: add the App ID and Secret key in Admin → Payment settings.",
    SDK_CASHFREE: "Could not load payment SDK. Check your network or ad blocker.",
    SDK_RAZORPAY: "Could not load Razorpay. Check your network or ad blocker.",
    PAYMENT_NOT_COMPLETED: "Payment was not completed. You can retry from your order page.",
    PAYMENT_CANCELLED: "Payment cancelled.",
    PAYMENT_INCOMPLETE: "Payment did not complete.",
    UNSUPPORTED_PROVIDER: "Unsupported payment provider.",
    COD_SUCCESS_TOAST: "Order placed — pay on delivery.",
    ONLINE_SUCCESS_TOAST: "Payment successful — thank you for your order.",
    CONFIRMING_PAYMENT: "Confirming payment…",
    MISSING_ORDER_REF: "Missing order reference. Return to checkout.",
  },
} as const;

/** Used by `src/utils/asyncHandler.ts` (NextResponse error wrapper). */
export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: API_MESSAGES.COMMON.INTERNAL_ERROR,
  CONNECTION_ERROR: "Database connection failed. Please try again later.",
  TIMEOUT_ERROR: "Request timed out. Please try again.",
  GENERIC_ERROR: API_MESSAGES.COMMON.INTERNAL_ERROR,
} as const;

export type ApiMessagesShape = typeof API_MESSAGES;
