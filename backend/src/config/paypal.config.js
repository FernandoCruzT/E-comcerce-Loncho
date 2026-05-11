const paypalConfig = {
  clientId:     process.env.PAYPAL_CLIENT_ID,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET,
  mode:         process.env.PAYPAL_MODE || 'sandbox',
  apiUrl:       process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com',
};

module.exports = paypalConfig;
