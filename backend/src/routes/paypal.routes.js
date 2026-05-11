const { Router } = require('express');
const { createOrder, captureOrder } = require('../controllers/paypal.controller');
const { authOpcional } = require('../middleware/auth.middleware');

const router = Router();

router.post('/create-order',  createOrder);
router.post('/capture-order', authOpcional, captureOrder);

module.exports = router;
