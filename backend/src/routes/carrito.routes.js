const express = require('express');
const {
  getCarrito,
  agregarProducto,
  actualizarCantidad,
  eliminarProducto,
  vaciarCarrito,
} = require('../controllers/carrito.controller');

const router = express.Router();

router.get('/',                 getCarrito);
router.post('/',                agregarProducto);
router.put('/:producto_id',     actualizarCantidad);
router.delete('/:producto_id',  eliminarProducto);
router.delete('/',              vaciarCarrito);

module.exports = router;
