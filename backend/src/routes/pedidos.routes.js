const express = require('express');
const { crearPedido, getPedidos, getPedidoById, cancelarPedido } = require('../controllers/pedidos.controller');

const router = express.Router();

router.post('/',                  crearPedido);
router.get('/',                   getPedidos);
router.get('/:id',                getPedidoById);
router.patch('/:id/cancelar',     cancelarPedido);

module.exports = router;
