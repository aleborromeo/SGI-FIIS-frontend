# SGI-FIIS Frontend 

Bienvenido al repositorio del frontend para el **Sistema de Gestión de Investigación (SGI-FIIS)**. 

Este proyecto está construido utilizando **React 19**, **Vite** y **TypeScript**, siguiendo una arquitectura de diseño modular (Feature-Sliced Design).

---

## 🛠️ Guía Rápida para el Equipo de Desarrollo

Sigue estos pasos para clonar el proyecto, instalar las dependencias y levantar el entorno local en tu máquina.

### 1. Clonar el repositorio

Abre tu terminal (Git Bash, PowerShell, etc.) y ejecuta el siguiente comando para descargar el código a tu equipo local:

```bash
git clone https://github.com/UNAS-FIIS/SGI-FIIS-frontend.git
```

### 2. Acceder a la carpeta del proyecto

Entra a la carpeta que se acaba de crear:

```bash
cd SGI-FIIS-frontend
```

### 3. Instalar las dependencias

Es necesario instalar todas las librerías requeridas (React, Vite, React Router, etc.). Ejecuta:

```bash
npm install
```

### 4. Levantar el servidor de desarrollo

Una vez instaladas las dependencias, ya puedes ejecutar la aplicación en modo desarrollo:

```bash
npm run dev
```

La terminal te mostrará una dirección local, usualmente `http://localhost:5173`. Haz Ctrl+Clic o cópiala y pégala en tu navegador.


> **IMPORTANTE:** Crea tus propios componentes, hooks y estilos dentro de tu carpeta. Si consideras que un componente (como un botón o un input) puede ser útil para todos, colócalo en `src/components/ui/` y avisa al equipo.

---

## 🏗️ Comandos Útiles

- `npm run dev`: Levanta el servidor local.
- `npm run build`: Compila la aplicación optimizada para producción (carpeta `dist`).
- `npm run preview`: Previsualiza localmente el build de producción.
