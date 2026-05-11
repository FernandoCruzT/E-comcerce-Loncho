const express = require('express');
const cors = require('cors');
require('dotenv').config();

const productosRoutes = require('./routes/productos.routes');
const paypalRoutes    = require('./routes/paypal.routes');
const authRoutes      = require('./routes/auth.routes');
const carritoRoutes   = require('./routes/carrito.routes');
const pedidosRoutes   = require('./routes/pedidos.routes');
const authMiddleware  = require('./middleware/auth.middleware');

const app = express();

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Loncho API - Backend activo', version: '1.0.0' });
});

app.use('/api/productos', productosRoutes);
app.use('/api/paypal',   paypalRoutes);
app.use('/api/auth',     authRoutes);
app.use('/api/carrito',  authMiddleware, carritoRoutes);
app.use('/api/pedidos',  authMiddleware, pedidosRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

module.exports = app;
