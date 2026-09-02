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
./.venv/Scripts/python manage.py loaddata grados modulos modulo_grado contenidos laboratorios actividades preguntas
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

### Pruebas

```
cd backend
./.venv/Scripts/python manage.py test apps.accounts apps.academics apps.labs apps.submissions
```

Cubren lo más crítico: login/JWT, que el registro asigna el grado elegido, que un profesor solo ve
estudiantes/entregas de sus grados asignados (y un admin no tiene esa restricción), que un estudiante no
puede acceder a laboratorios de otro grado, que la respuesta correcta de un quiz nunca viaja al estudiante,
y que la autocalificación de opción múltiple funciona. No es una suite exhaustiva (`content` y
`assignments` aún no tienen pruebas propias), pero cubre los límites de permisos de los que depende el
aislamiento de datos entre grados y roles en toda la plataforma.

```
cd frontend
npm run lint
```

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
- ✅ Módulo `labs` **completo**: los 6 tipos de laboratorio funcionando de punta a punta — `quiz` (autocalificado), `entrega_archivo`, `direccionamiento_ip`, `ensamble_pc` (drag & drop), `editor_web` (CodeMirror + vista previa en vivo) y `simulador_bd` (crear tablas/campos/registros/relaciones, validado por criterios configurables: mínimo de tablas, campos, registros y relaciones).
- ✅ Módulos `assignments`/`submissions`: actividades (opcionalmente ligadas a un laboratorio, con preguntas propias) creadas por admin/profesor por grado; el estudiante entrega (respuestas + archivo opcional), las opción-múltiple/verdadero-falso se autocalifican, y el profesor revisa, califica y escribe observaciones desde el frontend.
- ✅ Frontend: login, registro con selección de grado, pantallas de inicio por rol. Estudiante ve módulos, contenidos, laboratorios y actividades reales de su grado (con calificación y observaciones una vez revisadas). CodeMirror se carga en un chunk aparte (`React.lazy`).
- ✅ **Panel del profesor**: `/profesor/estudiantes`, `/profesor/contenidos` (crear/editar/eliminar contenidos y materiales de apoyo dentro de los módulos ya asignados a sus grados), `/profesor/laboratorios` (crear/editar/eliminar los 6 tipos, con plantilla de configuración JSON por tipo) y `/profesor/actividades` (crear/editar/eliminar, preguntas, revisar/calificar entregas). Restringido a los grados asignados al profesor; asignar un módulo a un grado sigue siendo exclusivo del administrador (decisión curricular, no de contenido).
- ✅ **Panel de administración** (`/admin/...`): reutiliza las mismas pantallas del profesor (estudiantes, contenidos, laboratorios, actividades) pero sin restricción de grado (branching por rol dentro de cada componente), más pantallas propias: `/admin/profesores` (crear profesores y asignarles/reasignarles grados), `/admin/grados` (editar descripción de los 4 grados fijos) y `/admin/modulos` (catálogo global de módulos, y asignación de módulos a grados). El admin también puede activar/desactivar cuentas de estudiante.
- ✅ El cuerpo de un contenido (texto/markdown plano) se puede editar después de creado desde "Editar cuerpo" en la tarjeta del contenido, y ahora sí llega al estudiante: antes el serializer de `/mis-modulos/` no lo incluía, así que aunque se escribiera nunca era visible. El estudiante lo lee expandiendo el tema (junto con su descripción y materiales) en "Mis módulos".
- ⏳ Pendiente: soporte de formato enriquecido (el cuerpo se muestra como texto plano, sin renderizar markdown).

## Usuarios de prueba (solo entorno local)

Creados manualmente durante el desarrollo — no vienen en el repositorio:
- Admin: creado con `createsuperuser`.
- Estudiante de prueba: registrar desde `/registro` en el frontend, o vía `POST /api/academics/estudiantes/registro/`.
