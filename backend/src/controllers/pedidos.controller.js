const pool = require('../config/db');

/**
 * Función interna reutilizable: crea un pedido a partir del carrito del usuario.
 * Corre dentro de una transacción para garantizar atomicidad.
 *
 * @param {object} opts
 * @param {number}  opts.usuarioId
 * @param {string}  [opts.status='CREADO']
 * @param {string}  [opts.paypalOrderId]
 * @param {string}  [opts.paypalStatus]
 * @returns {object} pedido recién creado
 */
/**
 * @param {object}  opts
 * @param {number}  opts.usuarioId
 * @param {string}  [opts.status='CREADO']
 * @param {string}  [opts.paypalOrderId]
 * @param {string}  [opts.paypalStatus]
 * @param {boolean} [opts.procesarStock=true]  false → solo registra, no descuenta stock ni vacía carrito
 */
async function crearPedidoCore({
  usuarioId,
  status        = 'CREADO',
  paypalOrderId = null,
  paypalStatus  = null,
  procesarStock = true,
}) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Obtener ítems del carrito (bloqueo solo si vamos a descontar stock)
    const lockClause = procesarStock ? 'FOR UPDATE OF p' : '';
    const cartResult = await client.query(
      `SELECT c.producto_id, c.cantidad,
              p.nombre, p.precio, p.stock
       FROM carrito c
       JOIN productos p ON p.id = c.producto_id
       WHERE c.usuario_id = $1
       ${lockClause}`,
      [usuarioId]
    );

    if (cartResult.rows.length === 0) {
      throw Object.assign(new Error('El carrito está vacío'), { statusCode: 400 });
    }

    // 2. Validar stock solo cuando corresponde procesarlo
    if (procesarStock) {
      for (const item of cartResult.rows) {
        if (item.cantidad > item.stock) {
          throw Object.assign(
            new Error(`Stock insuficiente para "${item.nombre}". Disponible: ${item.stock}`),
            { statusCode: 409 }
          );
        }
      }
    }

    // 3. Calcular totales
    const subtotal = cartResult.rows.reduce(
      (acc, i) => acc + parseFloat(i.precio) * i.cantidad, 0
    );
    const iva   = subtotal * 0.16;
    const total = subtotal + iva;

    // 4. Insertar pedido
    const pedidoResult = await client.query(
      `INSERT INTO pedidos (usuario_id, status, subtotal, iva, total, paypal_order_id, paypal_status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [usuarioId, status, subtotal.toFixed(2), iva.toFixed(2), total.toFixed(2), paypalOrderId, paypalStatus]
    );
    const pedido = pedidoResult.rows[0];

    // 5. Insertar ítems y —opcionalmente— descontar stock y vaciar carrito
    for (const item of cartResult.rows) {
      const itemSubtotal = parseFloat(item.precio) * item.cantidad;

      await client.query(
        `INSERT INTO pedido_items (pedido_id, producto_id, nombre, precio, cantidad, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [pedido.id, item.producto_id, item.nombre, item.precio, item.cantidad, itemSubtotal.toFixed(2)]
      );

      if (procesarStock) {
        await client.query(
          `UPDATE productos
           SET stock      = stock - $1,
               en_stock   = CASE WHEN (stock - $1) <= 0 THEN false ELSE en_stock END,
               updated_at = NOW()
           WHERE id = $2`,
          [item.cantidad, item.producto_id]
        );
      }
    }

    if (procesarStock) {
      await client.query('DELETE FROM carrito WHERE usuario_id = $1', [usuarioId]);
    }

    await client.query('COMMIT');
    return pedido;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/* ────────────────────────────────────────────────────────────
   POST /api/pedidos
   Crea un pedido en status CREADO desde el carrito del usuario
──────────────────────────────────────────────────────────── */
const crearPedido = async (req, res) => {
  try {
    const pedido = await crearPedidoCore({ usuarioId: req.usuario.id });
    res.status(201).json(pedido);
  } catch (err) {
    console.error('Error en crearPedido:', err);
    res.status(err.statusCode ?? 500).json({ error: err.message });
  }
};

/* ────────────────────────────────────────────────────────────
   GET /api/pedidos
   Lista los pedidos del usuario autenticado con sus ítems
──────────────────────────────────────────────────────────── */
const getPedidos = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id',          pi.id,
                    'producto_id', pi.producto_id,
                    'nombre',      pi.nombre,
                    'precio',      pi.precio,
                    'cantidad',    pi.cantidad,
                    'subtotal',    pi.subtotal
                  )
                ) FILTER (WHERE pi.id IS NOT NULL),
                '[]'
              ) AS items
       FROM pedidos p
       LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
       WHERE p.usuario_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [req.usuario.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error en getPedidos:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* ────────────────────────────────────────────────────────────
   GET /api/pedidos/:id
   Detalle de un pedido con sus ítems (solo el propietario)
──────────────────────────────────────────────────────────── */
const getPedidoById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT p.*,
              COALESCE(
                json_agg(
                  json_build_object(
                    'id',          pi.id,
                    'producto_id', pi.producto_id,
                    'nombre',      pi.nombre,
                    'precio',      pi.precio,
                    'cantidad',    pi.cantidad,
                    'subtotal',    pi.subtotal
                  )
                ) FILTER (WHERE pi.id IS NOT NULL),
                '[]'
              ) AS items
       FROM pedidos p
       LEFT JOIN pedido_items pi ON pi.pedido_id = p.id
       WHERE p.id = $1 AND p.usuario_id = $2
       GROUP BY p.id`,
      [id, req.usuario.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error en getPedidoById:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* ────────────────────────────────────────────────────────────
   PATCH /api/pedidos/:id/cancelar
   Cancela un pedido CREADO y devuelve el stock a productos
──────────────────────────────────────────────────────────── */
const cancelarPedido = async (req, res) => {
  const { id } = req.params;
  const client  = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Obtener y bloquear el pedido
    const pedidoResult = await client.query(
      `SELECT * FROM pedidos WHERE id = $1 AND usuario_id = $2 FOR UPDATE`,
      [id, req.usuario.id]
    );

    if (pedidoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const pedido = pedidoResult.rows[0];

    if (pedido.status !== 'CREADO') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Solo se pueden cancelar pedidos en estado CREADO',
      });
    }

    // 2. Obtener los ítems para devolver el stock
    const itemsResult = await client.query(
      `SELECT producto_id, cantidad FROM pedido_items WHERE pedido_id = $1`,
      [id]
    );

    // 3. Restaurar stock en productos
    for (const item of itemsResult.rows) {
      await client.query(
        `UPDATE productos
         SET stock      = stock + $1,
             en_stock   = true,
             updated_at = NOW()
         WHERE id = $2`,
        [item.cantidad, item.producto_id]
      );
    }

    // 4. Actualizar status del pedido
    await client.query(
      `UPDATE pedidos SET status = 'CANCELADO', updated_at = NOW() WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');
    res.json({ mensaje: 'Pedido cancelado correctamente', pedidoId: Number(id) });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error en cancelarPedido:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
};

module.exports = { crearPedido, getPedidos, getPedidoById, crearPedidoCore, cancelarPedido };
