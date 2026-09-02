# Laboratorio Virtual de Informática

Plataforma educativa para el área de Informática y Tecnología, grados 8° a 11°.
Ver arquitectura completa en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md).

## Estructura

```
backend/    Django + Django REST Framework (API)
frontend/   React + Vite (SPA)
docs/       Documentación de arquitectura
```

## Desarrollo local (sin Docker)

Usa SQLite automáticamente cuando no hay `DATABASE_URL` configurada — ideal para desarrollar rápido.

### Backend

```
cd backend
python -m venv .venv
./.venv/Scripts/pip install -r requirements.txt   # Windows
./.venv/Scripts/python manage.py migrate
./.venv/Scripts/python manage.py loaddata grados modulos modulo_grado contenidos laboratorios   # incluye el simulador de IP
./.venv/Scripts/python manage.py createsuperuser
./.venv/Scripts/python manage.py runserver 8000
```

Variables de entorno opcionales (crear `.env` en la raíz del proyecto, ver `.env.example`):
`DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`.

### Frontend

```
cd frontend
npm install
npm run dev
```

Variable de entorno: `VITE_API_URL` (ver `frontend/.env.example`). Por defecto apunta a `http://localhost:8000/api`.

## Despliegue con Docker Compose (Postgres + backend + frontend)

```
cp .env.example .env   # ajustar valores
docker compose up --build
```

- Backend disponible en `:8000`
- Frontend (Nginx sirviendo el build de React) en `:5173`
- Postgres persistido en volumen `db_data`

## Estado actual

- ✅ Módulo `accounts`: usuarios con rol (admin/profesor/estudiante), login JWT, `/me`.
- ✅ Módulo `academics`: grados fijos (8°-11°), registro público de estudiante, gestión de profesores y su asignación a grados.
- ✅ Módulo `content`: catálogo de módulos, asignación módulo-grado, contenidos, con datos reales de 8° a 11°. El estudiante ve sus propios módulos y contenidos en `/api/content/mis-modulos/`.
- ✅ Módulo `labs`: laboratorios tipo `quiz` (autocalificado), `entrega_archivo` y **`direccionamiento_ip`** (simulador interactivo con validación real de red/máscara/gateway usando el módulo `ipaddress`) funcionando de punta a punta. Tipos `ensamble_pc`, `editor_web` y `simulador_bd` modelados pero pendientes de construir su UI.
- ✅ Frontend: login, registro con selección de grado, pantallas de inicio por rol. La de estudiante muestra módulos, contenidos y laboratorios reales de su grado, con reproductor de laboratorio (quiz / entrega de archivo / simulador de direccionamiento IP en `src/labs-engine/`).
- ⏳ Pendiente: simuladores de ensamble de PC, editor web y base de datos; `assignments`/`submissions` (actividades formales, entregas, calificaciones, observaciones del profesor).

## Usuarios de prueba (solo entorno local)

Creados manualmente durante el desarrollo — no vienen en el repositorio:
- Admin: creado con `createsuperuser`.
- Estudiante de prueba: registrar desde `/registro` en el frontend, o vía `POST /api/academics/estudiantes/registro/`.
