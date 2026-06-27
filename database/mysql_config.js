/**
 * ISO Platform — Configuración de conexión MySQL
 * (Configuración de referencia para entornos Javascript/Node si se requiere en el futuro)
 */

module.exports = {
  connectionLimit: 10,
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'iso_db',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4'
};
