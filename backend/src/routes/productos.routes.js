const { Router } = require('express');
const {
  getProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
} = require('../controllers/productos.controller');

const router = Router();

router.get('/', getProductos);
router.get('/:id', getProductoById);
router.post('/', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);

module.exports = router;
