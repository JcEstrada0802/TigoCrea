# B-Planning: Sistema de Gestión de Programación y Reportería de TV

Este repositorio aloja el código fuente de **TigoCrea**, la plataforma diseñada para centralizar la gestión de contenido de transmisión y generar auditorías precisas sobre la emisión de medios en canales de TV.

## Propósito del Proyecto

El objetivo principal es asegurar la **integridad y el cumplimiento de la transmisión televisiva** mediante la generación automatizada de *playlists* y la verificación posterior de lo emitido.

## Módulos Principales

| Módulo | Backend (Django) | Frontend (React) |
| :--- | :--- | :--- |
| ** Catálogo de Contenido** | `catalogo` | `src/components/Catalogacion` |
| ** Programación / Playlists** | `programacion` | `src/components/Programacion` |
| ** Reportería de Transmisión** | `reporteria` (incluye Watcher) | `src/components/Reporteria` |

## Arquitectura del Módulo de Reportería (Adaptabilidad)

Este módulo fue diseñado para ser **agnóstico a la fuente de datos** de transmisión. Aunque actualmente procesa archivos AsRunLog de sistemas específicos, puede adaptarse a cualquier proveedor.

La lógica de adaptación se encuentra en la carpeta `backend/reporteria/watcher`:

* **`watcher.py`**: Es el servicio de vigilancia que monitorea las carpetas donde los *players* depositan sus archivos de log (`asrunlog files`).
* **`processors.py`**: Contiene las clases y funciones encargadas de **interpretar y estandarizar** el contenido de cada formato de AsRunLog. Para integrar un nuevo *player*, el único cambio necesario es **añadir su lógica de procesamiento aquí**.
* **`upgrader.py`**: Se encarga de tomar los datos estandarizados y realizar la inserción masiva a la base de datos PostgreSQL.

---

## Instalación y Desarrollo

### Prerrequisitos
- Python 3.x
- Node.js y npm
- PostgreSQL (Base de datos recomendada)

### 1. Backend (Django)

1.  Navega a la carpeta del backend:
    ```bash
    cd backend
    ```
2.  Crea e inicia el entorno virtual (si no lo has hecho):
    ```bash
    python3 -m venv .venv
    source .venv/bin/activate
    ```
3.  Instala las dependencias de Python:
    ```bash
    pip install -r requirements.txt
    ```
4.  Crea tu archivo **`.env`** para las claves de la base de datos y Django (consulta el `.env.example`).
5.  **Estructura de la Base de Datos (DB):** La estructura de la DB está definida por los archivos de migración que ya subiste. Para crear las tablas:
    ```bash
    python manage.py migrate
    ```
6.  Corre las migraciones y el servidor de desarrollo.

### 2. Frontend (React)

1.  Navega a la carpeta del frontend:
    ```bash
    cd ../front
    ```
2.  Instala las dependencias de Node:
    ```bash
    npm install
    ```
3.  Crea tu archivo **`.env`** para la dirección de tu backend (consulta el `.env.example`).
4.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```

---
