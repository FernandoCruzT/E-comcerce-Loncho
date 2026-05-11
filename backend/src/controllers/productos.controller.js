const pool = require('../config/db');

const getProductos = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, precio, image_url, categoria, descripcion, en_stock, stock, created_at, updated_at FROM productos ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getProductoById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, nombre, precio, image_url, categoria, descripcion, en_stock, stock, created_at, updated_at FROM productos WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createProducto = async (req, res) => {
  const { nombre, precio, image_url, categoria, descripcion, en_stock } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO productos (nombre, precio, image_url, categoria, descripcion, en_stock)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nombre, precio, image_url, categoria, descripcion, en_stock ?? true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, image_url, categoria, descripcion, en_stock } = req.body;
  try {
    const result = await pool.query(
      `UPDATE productos
       SET nombre = $1, precio = $2, image_url = $3, categoria = $4,
           descripcion = $5, en_stock = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [nombre, precio, image_url, categoria, descripcion, en_stock, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const deleteProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM productos WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente', producto: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
};
