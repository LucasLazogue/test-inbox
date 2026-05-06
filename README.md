# test-inbox — LangGraph Bridge POC

Pequeña interfaz para probar procesos e inbox.

Cómo usar:

- Abrir `test-inbox/index.html` en el navegador (o servir con un simple HTTP server).
- Pegar el JSON del `processDefinition` en la caja superior.
- Presionar `Execute` para enviar un POST a `http://localhost:8000/api/workflow/start`.
- El botón `Fetch Inbox` hace un GET a `http://localhost:8000/api/workflow/inbox`.

React (opción Vite):

1. Desde `test-inbox` instala dependencias:

```bash
cd test-inbox
npm install
```

2. Ejecuta en modo desarrollo:

```bash
npm run dev
```

Abre la URL que te muestre Vite (por defecto `http://localhost:5173`).

El proyecto usa `POST /api/workflow/start`, `GET /api/workflow/inbox` y `POST /api/workflow/{threadId}/inbox`.
- Si el inbox responde con tareas, la UI las mostrará en el chat y renderizará widgets:
  - Campos booleanos → botones **Aceptar / Rechazar**
  - Otros outputs → campo de texto + enviar

Endpoints usados (esperados en tu backend local):

- `POST /api/workflow/start` — recibir el processDefinition JSON
- `GET /api/workflow/inbox` — lista de tareas (array)
- `POST /api/workflow/{threadId}/inbox` — enviar respuestas para tareas

Endpoints usados en esta UI:

- `POST /api/workflow/start` — (local) recibe el `processDefinition` JSON. (START_URL)
- `GET /inbox` — en el servidor definido por el YAML: `http://localhost:8080/PiaMiddleware_Beta_NewLocalDevJava/v3/processes/instances/inbox` (INBOX_BASE + `/inbox`)
- `POST /{threadId}/inbox` — en el mismo `INBOX_BASE` (INBOX_BASE + `/{threadId}/inbox`)

Notas:

- Si el backend no está disponible, la UI mostrará un task mock para demo.
- Puedes servir los archivos con Python muy rápido:

```bash
python -m http.server 5500 -d test-inbox
```

Luego abre `http://localhost:5500`.

## Specs

| Spec | Brief Summary | Implemented |
|---|---|---|
| [Yellow and Black Color Palette Update](docs/specs/SPEC_YELLOW_BLACK_COLOR_PALETTE_UPDATE.md) | Replace the current color palette with yellow and black tones in the application to enhance visual identity. | No |
