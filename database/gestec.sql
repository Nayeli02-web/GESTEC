CREATE DATABASE gestec;
USE gestec;

-- === ROLES ===
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE
);

-- === USUARIOS (Clientes, Técnicos, Administradores) ===
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  telefono VARCHAR(30),
  rol_id INT NOT NULL,
  FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- === TÉCNICOS ===
CREATE TABLE tecnicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE,
  disponible TINYINT(1) DEFAULT 1,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- === ESPECIALIDADES ===
CREATE TABLE especialidades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE
);

-- Relación muchos a muchos entre técnicos y especialidades
CREATE TABLE tecnico_especialidad (
  tecnico_id INT NOT NULL,
  especialidad_id INT NOT NULL,
  PRIMARY KEY (tecnico_id, especialidad_id),
  FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id) ON DELETE CASCADE,
  FOREIGN KEY (especialidad_id) REFERENCES especialidades(id) ON DELETE CASCADE
);

-- === CATEGORÍAS ===
CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255)
);

-- === ETIQUETAS ===
CREATE TABLE etiquetas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  categoria_id INT,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- === Relación Categoría ↔ Especialidad (muchos a muchos)
CREATE TABLE categoria_especialidad (
  categoria_id INT NOT NULL,
  especialidad_id INT NOT NULL,
  PRIMARY KEY (categoria_id, especialidad_id),
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE,
  FOREIGN KEY (especialidad_id) REFERENCES especialidades(id) ON DELETE CASCADE
);

-- === Relación Categoría ↔ SLA (uno a uno)
ALTER TABLE categorias ADD COLUMN sla_id INT;
ALTER TABLE categorias ADD FOREIGN KEY (sla_id) REFERENCES sla(id);

-- === SLA (Tiempos de respuesta y resolución) ===
CREATE TABLE sla (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  tiempo_respuesta INT NOT NULL,
  tiempo_resolucion INT NOT NULL
);

-- === TICKETS ===
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descripcion VARCHAR(250),
  prioridad ENUM('baja','media','alta') DEFAULT 'media',
  estado ENUM('pendiente','asignado','en_proceso','resuelto','cerrado') DEFAULT 'pendiente',
  cliente_id INT NOT NULL,
  tecnico_id INT,
  categoria_id INT,
  sla_id INT,
  fecha_creacion DATETIME ,
  fecha_cierre DATETIME,
  FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
  FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id),
  FOREIGN KEY (categoria_id) REFERENCES categorias(id),
  FOREIGN KEY (sla_id) REFERENCES sla(id)
);

-- === HISTORIAL DE TICKETS ===
CREATE TABLE historial_tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  estado_anterior VARCHAR(50),
  estado_nuevo VARCHAR(50),
  observacion VARCHAR(250),
  fecha DATETIME ,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- === ASIGNACIONES ===
CREATE TABLE asignaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  tecnico_id INT NOT NULL,
  fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  metodo ENUM('manual','automatica') DEFAULT 'manual',
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (tecnico_id) REFERENCES tecnicos(id)
);

-- === NOTIFICACIONES ===
CREATE TABLE notificaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  tipo ENUM('asignacion','estado','mensaje') NOT NULL,
  mensaje VARCHAR(255),
  leida TINYINT(1) DEFAULT 0,
  fecha DATETIME,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);



-- === REGLAS DE AUTOTRIAGE ===
CREATE TABLE reglas_autotriage (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  activa TINYINT(1) DEFAULT 1
);


-- === VALORACIONES DEL SERVICIO ===
CREATE TABLE valoraciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL UNIQUE,
  puntuacion TINYINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
  comentario VARCHAR(255),
  fecha DATETIME,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- === IMÁGENES ===
CREATE TABLE imagenes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  nombre_archivo VARCHAR(255) NOT NULL,
  ruta VARCHAR(255),
  FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);

-- Desactivar restricciones temporales
SET FOREIGN_KEY_CHECKS = 0;

-- Vaciar todas las tablas
TRUNCATE TABLE imagenes;
TRUNCATE TABLE valoraciones;
TRUNCATE TABLE historial_tickets;
TRUNCATE TABLE asignaciones;
TRUNCATE TABLE notificaciones;
TRUNCATE TABLE tickets;
TRUNCATE TABLE tecnico_especialidad;
TRUNCATE TABLE tecnicos;
TRUNCATE TABLE categoria_especialidad;
TRUNCATE TABLE etiquetas;
TRUNCATE TABLE categorias;
TRUNCATE TABLE especialidades;
TRUNCATE TABLE usuarios;
TRUNCATE TABLE roles;
TRUNCATE TABLE sla;
TRUNCATE TABLE reglas_autotriage;

-- Reactivar restricciones
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- ROLES
-- =========================================================
INSERT INTO roles (nombre) VALUES 
('Administrador'),
('Cliente'),
('Técnico');

-- =========================================================
-- USUARIOS
-- =========================================================
INSERT INTO usuarios (nombre, correo, contrasena, telefono, rol_id) VALUES
('María López', 'maria@correo.com', '12345', '8888-1111', 2), -- cliente
('Carlos Jiménez', 'carlos@correo.com', '12345', '8888-2222', 2),
('Ana Torres', 'ana@correo.com', '12345', '8888-3333', 2),
('Pedro Sánchez', 'pedro@correo.com', '12345', '8888-4444', 3), -- técnico
('Laura Méndez', 'laura@correo.com', '12345', '8888-5555', 3),
('José Vega', 'jose@correo.com', '12345', '8888-6666', 3),
('Admin Root', 'admin@correo.com', '12345', '8888-0000', 1);

-- =========================================================
-- TÉCNICOS
-- =========================================================
INSERT INTO tecnicos (usuario_id, disponible) VALUES
(4, 1),
(5, 1),
(6, 0),
(7,0);

-- =========================================================
-- ESPECIALIDADES
-- =========================================================
INSERT INTO especialidades (nombre) VALUES
('Redes'),
('Hardware'),
('Software');


-- Relación técnico ↔ especialidad
INSERT INTO tecnico_especialidad (tecnico_id, especialidad_id) VALUES
(1, 1),
(1, 2),
(2, 3),
(3, 1);

-- =========================================================
-- SLA
-- =========================================================
INSERT INTO sla (nombre, tiempo_respuesta, tiempo_resolucion) VALUES
('Crítico', 1, 4),
('Normal', 4, 24),
('Bajo', 8, 48),
('Crítico', 1, 15),
('Bajo', 8, 10);

-- =========================================================
-- CATEGORÍAS
-- =========================================================
INSERT INTO categorias (nombre, descripcion, sla_id) VALUES
('Red de Oficina', 'Problemas de conectividad interna', 1),
('Equipos de Cómputo', 'Fallas físicas o lógicas de equipos', 2),
('Aplicaciones', 'Errores en sistemas o software', 3),
('Correo Electrónico', 'Fallas en envío o recepción de correos institucionales, configuración de Outlook o Webmail.', 4),
('Seguridad Informática', 'Casos de virus, malware, alertas de seguridad o bloqueos de acceso no autorizado.', 5);

-- ETIQUETAS
INSERT INTO etiquetas (nombre, categoria_id) VALUES
('WiFi', 1),
('Switch', 1),
('Laptop', 2),
('Impresora', 2),
('ERP', 3),
('Correo', 3);

-- Relación categoría ↔ especialidad
INSERT INTO categoria_especialidad (categoria_id, especialidad_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 2),
(5,1);

-- =========================================================
-- TICKETS
-- =========================================================
INSERT INTO tickets (titulo, descripcion, prioridad, estado, cliente_id, tecnico_id, categoria_id, sla_id, fecha_creacion, fecha_cierre) VALUES
('Falla de red en oficina', 'No hay conexión a internet en el edificio A.', 'alta', 'resuelto', 1, 1, 1, 1, '2025-10-01 09:00:00', '2025-10-01 12:30:00'),
('Error en software ERP', 'El sistema no carga el módulo de facturación.', 'media', 'en_proceso', 2, 2, 3, 3, '2025-10-02 10:00:00', NULL),
('Laptop no enciende', 'Equipo del área de contabilidad no responde al encender.', 'alta', 'cerrado', 3, 3, 2, 2, '2025-10-03 08:15:00', '2025-10-04 15:00:00'),
('Correo no sincroniza', 'No se actualizan los correos en Outlook.', 'baja', 'pendiente', 1, NULL, 3, 3, '2025-10-04 10:00:00', NULL);

-- =========================================================
-- HISTORIAL DE TICKETS
-- =========================================================
INSERT INTO historial_tickets (ticket_id, estado_anterior, estado_nuevo, observacion, fecha) VALUES
(1, 'pendiente', 'asignado', 'Asignado a técnico Pedro Sánchez', '2025-10-01 09:10:00'),
(1, 'asignado', 'en_proceso', 'Se revisó el router principal', '2025-10-01 10:00:00'),
(1, 'en_proceso', 'resuelto', 'Se reemplazó cableado dañado', '2025-10-01 12:00:00'),
(2, 'pendiente', 'asignado', 'Asignado a Laura Méndez', '2025-10-02 10:30:00'),
(2, 'asignado', 'en_proceso', 'Revisión del módulo ERP en curso', '2025-10-02 13:00:00'),
(3, 'pendiente', 'asignado', 'Asignado a José Vega', '2025-10-03 09:00:00'),
(3, 'asignado', 'en_proceso', 'Se cambió fuente de poder', '2025-10-03 13:00:00'),
(3, 'en_proceso', 'resuelto', 'Equipo encendió correctamente', '2025-10-04 11:00:00'),
(3, 'resuelto', 'cerrado', 'Confirmado por el usuario', '2025-10-04 15:00:00');

-- =========================================================
-- IMÁGENES
-- =========================================================
INSERT INTO imagenes (ticket_id, nombre_archivo, ruta) VALUES
(1,'router_danado.png', '/uploads/router_danado.png'),
(2,'equipo_ok.jpg', '/uploads/equipo_ok.png'),
(3,'erp.jpg', '/uploads/erp.jpg'),
(4, 'correo.jpg', '/uploads/correo.jpg');

-- =========================================================
-- VALORACIONES
-- =========================================================
INSERT INTO valoraciones (ticket_id, puntuacion, comentario, fecha) VALUES
(1, 5, 'Excelente atención y rápida solución.', '2025-10-02 08:00:00'),
(3, 4, 'Buen servicio, aunque tomó más tiempo del esperado.', '2025-10-05 09:00:00');

-- =========================================================
-- ASIGNACIONES
-- =========================================================
INSERT INTO asignaciones (ticket_id, tecnico_id, metodo) VALUES
(1, 1, 'automatica'),
(2, 2, 'manual'),
(3, 3, 'manual');

-- =========================================================
-- NOTIFICACIONES
-- =========================================================
INSERT INTO notificaciones (usuario_id, tipo, mensaje, leida, fecha) VALUES
(1, 'estado', 'Su ticket #1 ha sido resuelto', 0, NOW()),
(2, 'asignacion', 'Se le ha asignado un nuevo ticket', 1, NOW()),
(4, 'mensaje', 'Nuevo comentario en el ticket #2', 0, NOW());

-- =========================================================
-- REGLAS DE AUTOTRIAGE
-- =========================================================
INSERT INTO reglas_autotriage (nombre, descripcion, activa) VALUES
('Alta prioridad en red', 'Asignar automáticamente tickets de red con prioridad alta.', 1),
('Priorizar software', 'Asignar técnicos de software para categorías ERP.', 1),
('Equipo crítico', 'Tickets con prioridad alta deben notificarse al admin.', 1);