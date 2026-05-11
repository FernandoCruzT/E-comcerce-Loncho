const pool = require('../config/db');

const getCarrito = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.producto_id, c.cantidad, c.updated_at,
              p.nombre, p.precio, p.stock, p.image_url AS imagen, p.en_stock
       FROM carrito c
       JOIN productos p ON p.id = c.producto_id
       WHERE c.usuario_id = $1
       ORDER BY c.created_at ASC`,
      [req.usuario.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error en getCarrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const agregarProducto = async (req, res) => {
  const { producto_id, cantidad = 1 } = req.body;

  if (!producto_id) {
    return res.status(400).json({ error: 'producto_id es requerido' });
  }
  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return res.status(400).json({ error: 'cantidad debe ser un entero mayor a 0' });
  }

  try {
    const prod = await pool.query('SELECT stock, en_stock FROM productos WHERE id = $1', [producto_id]);
    if (prod.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    if (!prod.rows[0].en_stock || prod.rows[0].stock === 0) {
      return res.status(409).json({ error: 'Producto sin stock disponible' });
    }
    if (cantidad > prod.rows[0].stock) {
      return res.status(409).json({ error: `Stock insuficiente. Disponible: ${prod.rows[0].stock}` });
    }

    const result = await pool.query(
      `INSERT INTO carrito (usuario_id, producto_id, cantidad)
       VALUES ($1, $2, $3)
       ON CONFLICT (usuario_id, producto_id)
       DO UPDATE SET cantidad = carrito.cantidad + EXCLUDED.cantidad,
                     updated_at = NOW()
       RETURNING *`,
      [req.usuario.id, producto_id, cantidad]
    );

    // Re-validar que la cantidad acumulada no supere el stock
    const acumulado = result.rows[0].cantidad;
    if (acumulado > prod.rows[0].stock) {
      await pool.query(
        'UPDATE carrito SET cantidad = $1, updated_at = NOW() WHERE usuario_id = $2 AND producto_id = $3',
        [prod.rows[0].stock, req.usuario.id, producto_id]
      );
      return res.status(409).json({
        error: `Cantidad ajustada al stock máximo disponible: ${prod.rows[0].stock}`,
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error en agregarProducto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const actualizarCantidad = async (req, res) => {
  const { producto_id } = req.params;
  const { cantidad }    = req.body;

  if (!Number.isInteger(cantidad) || cantidad < 1) {
    return res.status(400).json({ error: 'cantidad debe ser un entero mayor a 0' });
  }

  try {
    const prod = await pool.query('SELECT stock FROM productos WHERE id = $1', [producto_id]);
    if (prod.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    if (cantidad > prod.rows[0].stock) {
      return res.status(409).json({ error: `Stock insuficiente. Disponible: ${prod.rows[0].stock}` });
    }

    const result = await pool.query(
      `UPDATE carrito SET cantidad = $1, updated_at = NOW()
       WHERE usuario_id = $2 AND producto_id = $3
       RETURNING *`,
      [cantidad, req.usuario.id, producto_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error en actualizarCantidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const eliminarProducto = async (req, res) => {
  const { producto_id } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM carrito WHERE usuario_id = $1 AND producto_id = $2 RETURNING *',
      [req.usuario.id, producto_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    res.json({ message: 'Producto eliminado del carrito' });
  } catch (error) {
    console.error('Error en eliminarProducto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const vaciarCarrito = async (req, res) => {
  try {
    await pool.query('DELETE FROM carrito WHERE usuario_id = $1', [req.usuario.id]);
    res.json({ message: 'Carrito vaciado correctamente' });
  } catch (error) {
    console.error('Error en vaciarCarrito:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getCarrito, agregarProducto, actualizarCantidad, eliminarProducto, vaciarCarrito };
