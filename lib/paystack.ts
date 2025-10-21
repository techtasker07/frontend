export const paystackConfig = {
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  secretKey: process.env.PAYSTACK_SECRET_KEY!,
  baseUrl: process.env.PAYSTACK_BASE_URL!,
  callbackUrl: process.env.PAYSTACK_CALLBACK_URL!,
  webhookUrl: process.env.PAYSTACK_WEBHOOK_URL!,
};