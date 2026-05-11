const config = require('../config/paypal.config');

async function getAccessToken() {
  const credentials = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

  const response = await fetch(`${config.apiUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Error al obtener token PayPal: ${err.error_description || response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function createOrder(items, totalAmount) {
  const accessToken = await getAccessToken();

  const itemsPaypal = items.map((item) => ({
    name:        item.nombre,
    quantity:    String(item.cantidad),
    unit_amount: {
      currency_code: 'MXN',
      value:         parseFloat(item.precio).toFixed(2),
    },
  }));

  const itemTotal = items
    .reduce((acc, item) => acc + item.cantidad * parseFloat(item.precio), 0)
    .toFixed(2);

  const orderPayload = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        amount: {
          currency_code: 'MXN',
          value:         totalAmount.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'MXN',
              value:         itemTotal,
            },
          },
        },
        description: 'Compra en Loncho',
        items:       itemsPaypal,
      },
    ],
    application_context: {
      brand_name:   'Loncho',
      landing_page: 'NO_PREFERENCE',
      user_action:  'PAY_NOW',
      return_url:   'http://localhost:4200/checkout?status=success',
      cancel_url:   'http://localhost:4200/checkout?status=cancel',
    },
  };

  const response = await fetch(`${config.apiUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderPayload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Error al crear orden PayPal: ${JSON.stringify(err)}`);
  }

  return response.json();
}

async function captureOrder(orderId) {
  const accessToken = await getAccessToken();

  const response = await fetch(`${config.apiUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Error al capturar pago PayPal: ${JSON.stringify(err)}`);
  }

  return response.json();
}

module.exports = { getAccessToken, createOrder, captureOrder };
