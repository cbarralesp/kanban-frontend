# kanban-frontend

Frontend del **Tablero Kanban** · Angular 21 · IPSS · Desarrollo de Software II · Clase 03

Tablero con tres columnas (**Por hacer → En curso → Hecha**) que consume la API REST del backend Spring Boot.

## Características

- Angular 21 **standalone y zoneless**, estado con **signals** (patrón Store/Facade).
- Crear, editar, eliminar (con confirmación) y **mover** tareas.
- **Arrastrar y soltar** con la API nativa de HTML5, más botones ← → como alternativa accesible. Sin librerías extra.
- La columna *En curso* avisa al llegar al límite de **3** tareas. Las reglas las valida el backend; los rechazos (409) se muestran como avisos.
- Tema oscuro y diseño responsivo: sin scroll lateral en 1366 px y columnas apiladas en pantallas angostas (≤ 800 px).
- Pruebas con **Vitest** y `HttpTestingController`.

## Estructura

```
src/app
├── core/          models · api (TareaApi) · interceptors (errorInterceptor)
├── shared/ui/     toast · confirm-dialog
└── features/tareas/
    ├── tareas.store.ts      estado con signals
    ├── pages/               tablero
    └── components/          tarea-card · tarea-form
```

## Ejecutar

Requiere Node 22+ y el backend corriendo en `http://localhost:8083`.

```bash
npm install
npm start                 # http://localhost:4200
```

`proxy.conf.json` reenvía `/api` al backend, por lo que no depende de CORS. Si el puerto 4200 está ocupado: `npx ng serve --port 4300`.

```bash
npx ng test --watch=false   # pruebas
npx ng build                # compilación de producción
```
