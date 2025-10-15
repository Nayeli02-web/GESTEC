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

