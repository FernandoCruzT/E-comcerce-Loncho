const app = require('./app');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor Loncho corriendo en http://localhost:${PORT}`);
  console.log(`Endpoints disponibles:`);
  console.log(`  GET    http://localhost:${PORT}/api/productos`);
  console.log(`  GET    http://localhost:${PORT}/api/productos/:id`);
  console.log(`  POST   http://localhost:${PORT}/api/productos`);
  console.log(`  PUT    http://localhost:${PORT}/api/productos/:id`);
  console.log(`  DELETE http://localhost:${PORT}/api/productos/:id`);
});
