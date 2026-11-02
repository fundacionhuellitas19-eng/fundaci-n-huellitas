
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario      INT AUTO_INCREMENT PRIMARY KEY,
  nombre          VARCHAR(60)  NOT NULL,
  apellido        VARCHAR(60)  NOT NULL,
  correo          VARCHAR(120) NOT NULL UNIQUE,
  telefono        VARCHAR(20)  NOT NULL,
  
  fecha_registro  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mascotas (
  id_mascota  INT AUTO_INCREMENT PRIMARY KEY,
  nombre      VARCHAR(60) NOT NULL UNIQUE,
  especie     ENUM('perro', 'gato') NOT NULL,
  sexo        ENUM('Macho', 'Hembra') NOT NULL,
  estado      ENUM('disponible', 'preadopcion', 'adoptado') NOT NULL DEFAULT 'disponible',
  foto        VARCHAR(200),
  descripcion TEXT
);

CREATE TABLE IF NOT EXISTS adopciones (
  id_adopcion     INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario      INT NOT NULL,
  id_mascota      INT NOT NULL,
  nombre_completo VARCHAR(120) NOT NULL,
  telefono        VARCHAR(20)  NOT NULL,
  vivienda        VARCHAR(30)  NOT NULL,
  motivo          TEXT NOT NULL,
  estado          VARCHAR(30) NOT NULL DEFAULT 'En revisión',
  fecha           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario),
  FOREIGN KEY (id_mascota) REFERENCES mascotas (id_mascota)
);

CREATE TABLE IF NOT EXISTS reportes (
  id_reporte  INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario  INT NULL,
  animal      VARCHAR(40)  NOT NULL,
  situacion   VARCHAR(60)  NOT NULL,
  descripcion TEXT,
  ubicacion   VARCHAR(200) NOT NULL,
  anonimo     BOOLEAN NOT NULL DEFAULT FALSE,
  nombre      VARCHAR(120),
  telefono    VARCHAR(20),
  estado      VARCHAR(30) NOT NULL DEFAULT 'En verificación',
  fecha       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
);

CREATE TABLE IF NOT EXISTS mensajes_buzon (
  id_mensaje INT AUTO_INCREMENT PRIMARY KEY,
  tipo       VARCHAR(40)  NOT NULL,
  nombre     VARCHAR(120) NOT NULL,
  correo     VARCHAR(120),
  mensaje    TEXT NOT NULL,
  fecha      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS encuesta_participaciones (
  id_participacion INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario       INT NULL,
  fecha            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
);

CREATE TABLE IF NOT EXISTS encuesta_respuestas (
  id_respuesta     INT AUTO_INCREMENT PRIMARY KEY,
  id_participacion INT NOT NULL,
  pregunta         TINYINT NOT NULL,
  opcion           TINYINT NOT NULL,
  FOREIGN KEY (id_participacion) REFERENCES encuesta_participaciones (id_participacion)
);

CREATE TABLE IF NOT EXISTS voluntarios (
  id_voluntario INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario    INT NULL,
  nombre        VARCHAR(120) NOT NULL,
  ciudad        VARCHAR(60)  NOT NULL,
  areas         VARCHAR(200),
  fecha         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
);

CREATE TABLE IF NOT EXISTS aliados (
  id_aliado INT AUTO_INCREMENT PRIMARY KEY,
  nombre    VARCHAR(120) NOT NULL,
  tipo      VARCHAR(40)  NOT NULL,
  ciudad    VARCHAR(60)  NOT NULL,
  telefono  VARCHAR(20)  NOT NULL,
  servicios TEXT,
  estado    VARCHAR(30) NOT NULL DEFAULT 'En revisión',
  fecha     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT IGNORE INTO mascotas (nombre, especie, sexo, estado, foto) VALUES
  ('Mona',   'gato',  'Hembra', 'disponible',  'imagenes/mural/mona.webp'),
  ('Lucas',  'perro', 'Macho',  'disponible',  'imagenes/mural/lucas.webp'),
  ('Canela', 'gato',  'Hembra', 'disponible',  'imagenes/adopcion/canela.webp'),
  ('Negra',  'perro', 'Hembra', 'disponible',  'imagenes/adopcion/negra.webp'),
  ('Oreo',   'gato',  'Macho',  'disponible',  'imagenes/adopcion/oreo.webp'),
  ('Mila',   'gato',  'Hembra', 'preadopcion', 'imagenes/mural/mila.webp');
