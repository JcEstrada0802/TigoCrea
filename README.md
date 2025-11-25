# TigoCrea: Sistema de Gestión de Programación y Reportería de TV

Este repositorio aloja el código fuente de **TigoCrea**, la plataforma diseñada para centralizar la gestión de contenido de transmisión y generar auditorías precisas sobre la emisión de medios en canales de TV.

## Propósito del Proyecto

El objetivo principal es asegurar la **integridad y el cumplimiento de la transmisión televisiva** mediante la generación automatizada de *playlists* y la verificación posterior de lo emitido.

## 🛠️ Módulos Principales

| Módulo | Backend (Django) | Frontend (React) |
| :--- | :--- | :--- |
| ** Catálogo de Contenido** | `catalogo` | `src/components/Catalogacion` |
| ** Programación / Playlists** | `programacion` | `src/components/Programacion` |
| ** Reportería de Transmisión** | `reporteria` (incluye Watcher) | `src/components/Reporteria` |

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
    pip install -r requirements.txt # Asegúrate de crear este archivo primero
    ```
4.  Crea tu archivo `.env` para las claves de la base de datos y Django (este archivo está ignorado por Git).
      puedes ver el .env.example para guiarte
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
3.  Crea tu archivo `.env` para la dirección de tu backend (este archivo está ignorado por Git).
      puedes ver el .env.example para guiarte
4.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```

---
