-- ============================================================
-- Loncho DB - Script de base de datos
-- ============================================================

-- Crear base de datos (ejecutar como superusuario si no existe)
-- CREATE DATABASE loncho_db;

-- Conectarse a loncho_db antes de ejecutar el resto:
-- \c loncho_db

-- ============================================================
-- Tabla: productos
-- ============================================================
CREATE TABLE IF NOT EXISTS productos (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(150)   NOT NULL,
  precio      NUMERIC(10, 2) NOT NULL,
  image_url   TEXT,
  categoria   VARCHAR(100),
  descripcion TEXT,
  en_stock    BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP      NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Datos iniciales - 10 productos de ropa urbana Loncho
-- ============================================================
INSERT INTO productos (nombre, precio, image_url, categoria, descripcion, en_stock) VALUES
(
  'Hoodie Oversized Negro',
  699.00,
  'https://images.unsplash.com/photo-1578681994506-b8f463449011?w=400&h=500&fit=crop',
  'Hoodies',
  'Hoodie de corte oversized en color negro. Tela gruesa de algodón fleece, perfecto para el día a día urbano.',
  TRUE
),
(
  'Cargo Pants Gris',
  849.00,
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop',
  'Pantalones',
  'Pantalón cargo en tono gris con múltiples bolsillos funcionales. Corte recto y cómodo.',
  TRUE
),
(
  'Tee Gráfica Loncho',
  399.00,
  'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop',
  'Camisetas',
  'Playera de algodón 100% con gráfica exclusiva de Loncho. Corte unisex.',
  TRUE
),
(
  'Jogger Fleece Crema',
  599.00,
  'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400&h=500&fit=crop',
  'Pantalones',
  'Jogger de felpa suave en tono crema. Cintura elástica ajustable y puños en los tobillos.',
  TRUE
),
(
  'Bomber Jacket Negra',
  1299.00,
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop',
  'Chamarras',
  'Bomber jacket negra con forro interior suave. Cierre central y bolsillos laterales con zipper.',
  TRUE
),
(
  'Longsleeve Waffle Gris',
  449.00,
  'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=500&fit=crop',
  'Camisetas',
  'Playera manga larga con textura waffle en gris. Ligera y perfecta para capas.',
  TRUE
),
(
  'Gorra Dad Hat Loncho',
  299.00,
  'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=500&fit=crop',
  'Accesorios',
  'Gorra dad hat con bordado del logo Loncho. Ajuste posterior con hebilla metálica.',
  TRUE
),
(
  'Hoodie Zip Rojo',
  749.00,
  'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=400&h=500&fit=crop',
  'Hoodies',
  'Hoodie con cierre frontal completo en color rojo. Bolsillo canguro y capucha con cordón.',
  FALSE
),
(
  'Shorts Cargo Arena',
  499.00,
  'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&h=500&fit=crop',
  'Shorts',
  'Shorts cargo en tono arena con bolsillos laterales utilitarios. Ideal para temporada cálida.',
  TRUE
),
(
  'Tote Bag Loncho',
  199.00,
  'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&h=500&fit=crop',
  'Accesorios',
  'Tote bag de lona resistente con serigrafía del logo Loncho. Asas largas para cargar al hombro.',
  TRUE
);
