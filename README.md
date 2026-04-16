# 🗳️ Sistema de Votaciones UAT

**Universidad Autónoma de Tamaulipas**  
Proyecto de Desarrollo de Aplicaciones Web (DAWA)

---

## 📋 Descripción

Sistema web de votaciones electrónicas para procesos democráticos estudiantiles de la UAT. Permite a los estudiantes votar de forma remota, segura y eficiente usando sus credenciales institucionales.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Versión |
|------|------------|---------|
| Frontend | React | 19.x |
| Build | Vite | 5.x |
| Estilos | Tailwind CSS | 3.x |
| Gráficas | Chart.js + react-chartjs-2 | 4.x / 5.x |
| Backend | Node.js + Express | LTS / 4.18.2 |
| Base de datos | sql.js (SQLite embebido) | — |
| Autenticación | JWT (jsonwebtoken 9.0.2) | — |
| Contraseñas | bcryptjs 2.4.3 | — |
| CORS | cors 2.8.5 | — |

---

## 📁 Estructura del Proyecto

```
uat-votaciones/
├── client/                  # Aplicación React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx          # Pantalla de inicio de sesión
│   │   │   ├── Header.jsx         # Barra superior institucional
│   │   │   ├── Footer.jsx         # Pie de página
│   │   │   ├── VotacionPage.jsx   # Tarjetas de candidatos + votación
│   │   │   ├── ConfirmacionVoto.jsx  # Modal de confirmación (RF-08)
│   │   │   ├── AdminDashboard.jsx # Panel completo de administración
│   │   │   └── ResultadosChart.jsx   # Gráficas Bar + Pie (Chart.js)
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Estado global de autenticación
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                  # Servidor Node.js + Express
│   ├── server.js            # Punto de entrada + todas las rutas
│   ├── uat_votes.db         # Base de datos SQLite (se genera al iniciar)
│   └── package.json
│
└── README.md
```

---

## 🚀 Instalación y Ejecución

### Requisitos previos
- Node.js (versión LTS recomendada)
- npm

### 1. Instalar dependencias del Backend

```bash
cd server
npm install
```

### 2. Instalar dependencias del Frontend

```bash
cd client
npm install
```

### 3. Iniciar el Backend

```bash
cd server
node server.js
```

El servidor arrancará en: `http://localhost:3001`  
La base de datos `uat_votes.db` se creará automáticamente con datos de prueba.

### 4. Iniciar el Frontend (en otra terminal)

```bash
cd client
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

---

## 👤 Credenciales de Prueba

| Matrícula | Contraseña | Rol |
|-----------|------------|-----|
| `admin` | `admin123` | Administrador |
| `a2161150443` | `alumno123` | Alumno (Facultad de Derecho) |
| `a2223010012` | `alumno123` | Alumno (Facultad de Ingeniería) |
| `a2223010013` | `alumno123` | Alumno (Facultad de Comercio) |
| `a2223010014` | `alumno123` | Alumno (Facultad de Medicina) |

---

## 🔌 Endpoints de la API

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/login` | Autenticación de usuario | — |
| GET | `/api/candidatos` | Lista de candidatos | JWT |
| POST | `/api/votar` | Registrar voto | JWT |
| GET | `/api/resultados` | Resultados finales | JWT + Admin |
| GET | `/api/configuracion` | Configuración de la elección | JWT |
| GET | `/api/estado-eleccion` | Verificar si el usuario ya votó | JWT |
| GET | `/api/admin/usuarios` | Listar usuarios | JWT + Admin |
| POST | `/api/admin/usuarios` | Crear usuario | JWT + Admin |
| DELETE | `/api/admin/usuarios/:id` | Eliminar usuario | JWT + Admin |
| PUT | `/api/admin/configuracion` | Actualizar configuración | JWT + Admin |
| POST | `/api/admin/candidatos` | Agregar candidato | JWT + Admin |
| DELETE | `/api/admin/candidatos/:id` | Eliminar candidato | JWT + Admin |
| PUT | `/api/admin/eleccion/estado` | Activar/cerrar elección | JWT + Admin |
| GET | `/api/admin/bitacora` | Ver bitácora de actividades | JWT + Admin |

---

## 🔒 Seguridad Implementada

- **Contraseñas**: Hasheadas con `bcryptjs` (salt rounds = 10)
- **Sesiones**: JWT con expiración de 24 horas
- **Inactividad**: Sesión se cierra a los 10 minutos de inactividad (frontend)
- **Fuerza bruta**: Bloqueo temporal tras 3 intentos fallidos consecutivos (RF-03)
- **Voto único**: Constraint `UNIQUE(usuario_id, eleccion_id)` a nivel BD + validación en backend
- **Roles**: Middleware `esAdmin` protege todas las rutas administrativas
- **SQL Injection**: Consultas parametrizadas en todas las operaciones de BD
- **Anonimato del voto**: La tabla `votos` no expone la preferencia del estudiante públicamente
- **Bitácora**: Registro automático de todas las acciones administrativas

---

## 🗄️ Esquema de Base de Datos

### Tabla: `usuarios`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | Auto-incremental |
| matricula | TEXT UNIQUE | Identificador institucional |
| nombre | TEXT | Nombre completo |
| password | TEXT | Hash bcrypt |
| rol | TEXT | `admin` o `alumno` |
| facultad | TEXT | Facultad del estudiante |
| ha_votado | INTEGER | Flag: 0=no votó, 1=votó |

### Tabla: `candidatos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | Auto-incremental |
| nombre | TEXT | Nombre del candidato |
| partido | TEXT | Nombre del partido |
| foto | TEXT | Ruta de imagen |
| descripcion | TEXT | Propuesta |
| votos | INTEGER | Contador de votos |
| eleccion_id | INTEGER | Referencia a elección |

### Tabla: `votos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | Auto-incremental |
| usuario_id | INTEGER | FK → usuarios |
| candidato_id | INTEGER | FK → candidatos |
| eleccion_id | INTEGER | Identificador de elección |
| fecha | TIMESTAMP | Fecha y hora del voto |

### Tabla: `configuracion`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INTEGER PK | Siempre = 1 |
| titulo | TEXT | Nombre de la elección |
| fecha_inicio | TEXT | Inicio de votación |
| fecha_fin | TEXT | Cierre de votación |
| estado | TEXT | `activa`, `cerrada`, `pendiente` |

---

## 📊 Requisitos Funcionales Implementados

| RF | Descripción | Estado |
|----|-------------|--------|
| RF-01 | Autenticación por matrícula y contraseña | ✅ |
| RF-02 | Validación de identidad contra BD | ✅ |
| RF-03 | Bloqueo tras 3 intentos fallidos | ✅ |
| RF-04 | Control de voto duplicado | ✅ |
| RF-05 | Visualización de elecciones activas | ✅ |
| RF-06 | Información detallada de candidatos | ✅ |
| RF-07 | Selección de un único candidato | ✅ |
| RF-08 | Confirmación antes de registrar voto | ✅ |
| RF-09 | Registro automático de votos | ✅ |
| RF-10 | Generación automática de resultados | ✅ |
| RF-11 | Administración de elecciones | ✅ |
| RF-12 | Control diferenciado de roles | ✅ |

---

## 🏗️ Para Producción (Recomendaciones)

- Migrar base de datos a **MySQL** o **PostgreSQL** en AWS RDS
- Desplegar backend en **AWS EC2** con **PM2** como gestor de procesos
- Servir frontend compilado (`npm run build`) como archivos estáticos desde Express
- Configurar **HTTPS** con certificado SSL
- Definir variables de entorno en archivo `.env` (nunca en el repositorio)
- Agregar **CI/CD** con GitHub Actions

---

## 👥 Equipo

Proyecto académico — Universidad Autónoma de Tamaulipas  
Materia: Desarrollo de Aplicaciones Web (DAWA)
