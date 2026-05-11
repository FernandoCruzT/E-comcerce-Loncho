const paypalService       = require('../services/paypal.service');
const { crearPedidoCore } = require('./pedidos.controller');

async function createOrder(req, res) {
  try {
    const { items = [], total } = req.body;

    if (!total || isNaN(total) || total <= 0) {
      return res.status(400).json({ error: 'El total del pedido es inválido.' });
    }

    const order       = await paypalService.createOrder(items, parseFloat(total));
    const approvalUrl = order.links.find((l) => l.rel === 'approve')?.href;

    res.json({ orderID: order.id, approvalUrl });
  } catch (error) {
    console.error('createOrder error:', error.message);
    res.status(500).json({ error: error.message });
  }
}

async function captureOrder(req, res) {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: 'orderId es requerido.' });
  }

  /* ── 1. Capturar el pago con PayPal ── */
  let capture;
  try {
    capture = await paypalService.captureOrder(orderId);
  } catch (paypalErr) {
    console.error('captureOrder PayPal error:', paypalErr.message);

    // Intentar registrar pago fallido si el usuario está autenticado
    const fallido = await registrarPedidoSiHayUsuario(req.usuario, {
      status:        'PAGO_FALLIDO',
      paypalOrderId: orderId,
      paypalStatus:  'ERROR',
      procesarStock: false,
    });

    return res.status(402).json({
      error:        `Error al procesar el pago con PayPal: ${paypalErr.message}`,
      status:       'ERROR',
      orderID:      orderId,
      pedidoId:     fallido?.id    ?? null,
      pedidoStatus: fallido?.status ?? null,
    });
  }

  const paypalStatus = capture.status; // 'COMPLETED' | 'DECLINED' | etc.

  /* ── 2a. Pago COMPLETED ── */
  if (paypalStatus === 'COMPLETED') {
    const pedido = await registrarPedidoSiHayUsuario(req.usuario, {
      status:        'COMPLETADO',
      paypalOrderId: capture.id,
      paypalStatus:  capture.status,
      procesarStock: true,
    });

    return res.json({
      status:       capture.status,
      orderID:      capture.id,
      payerEmail:   capture.payer?.email_address   ?? null,
      amount:       capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount ?? null,
      pedidoId:     pedido?.id    ?? null,
      pedidoStatus: pedido?.status ?? null,
    });
  }

  /* ── 2b. Pago no completado (DECLINED u otro) ── */
  const fallido = await registrarPedidoSiHayUsuario(req.usuario, {
    status:        'PAGO_FALLIDO',
    paypalOrderId: capture.id,
    paypalStatus:  capture.status,
    procesarStock: false,
  });

  return res.status(402).json({
    error:        `El pago no fue completado. Estado PayPal: ${paypalStatus}`,
    status:       paypalStatus,
    orderID:      capture.id,
    payerEmail:   capture.payer?.email_address ?? null,
    pedidoId:     fallido?.id    ?? null,
    pedidoStatus: fallido?.status ?? null,
  });
}

/* ── Helper: crea el pedido en BD solo si hay usuario autenticado ── */
async function registrarPedidoSiHayUsuario(usuario, opts) {
  if (!usuario) return null;
  try {
    return await crearPedidoCore({ usuarioId: usuario.id, ...opts });
  } catch (err) {
    console.error('Error al registrar pedido en BD:', err.message);
    return null;
  }
}

module.exports = { createOrder, captureOrder };
