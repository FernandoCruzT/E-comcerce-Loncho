const jwt = require('jsonwebtoken');

/* Middleware estricto: rechaza si no hay token válido */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autorización requerido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

/* Middleware opcional: inyecta req.usuario si hay token válido, pero no bloquea */
const authOpcional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (authHeader?.startsWith('Bearer ')) {
    try {
      req.usuario = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    } catch {
      // token inválido o expirado — ignorar silenciosamente
    }
  }
  next();
};

module.exports = authMiddleware;
module.exports.authOpcional = authOpcional;
