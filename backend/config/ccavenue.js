export const ccavenueConfig = {
  merchantId: process.env.CCAVENUE_MERCHANT_ID || 'YOUR_MERCHANT_ID',
  workingKey: process.env.CCAVENUE_WORKING_KEY || 'YOUR_WORKING_KEY',
  accessCode: process.env.CCAVENUE_ACCESS_CODE || 'YOUR_ACCESS_CODE',
  redirectUrl: process.env.CCAVENUE_REDIRECT_URL || 'http://localhost:3000/api/payment/callback',
  cancelUrl: process.env.CCAVENUE_CANCEL_URL || 'http://localhost:3001/payment-failure',
};