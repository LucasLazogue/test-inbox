

## Summary

Actualiza la paleta de colores de la aplicación **Test Inbox** reemplazando los tokens CSS custom properties y los colores hardcodeados en `style.css` (único archivo de estilos) para usar amarillo (`#FFD600`) como color primario/acento y negro (`#000000`) como color base/fondo. Todos los elementos visuales — botones, mensajes, bordes, textos, estados interactivos y fondos — se ajustan a la nueva paleta manteniendo legibilidad y contraste WCAG AA.

## Problem Statement

En `style.css` (líneas 1-9), la aplicación define una paleta de colores basada en tonos navy/verde oscuro:

```css
:root{
  --bg:#0f1724;
  --card:#0b1220;
  --accent:#6ee7b7;
  --muted:#9aa4b2;
  --glass: rgba(255,255,255,0.03);
  --bubble-in:#0b6e4f;
  --bubble-out:#1f2937;
}
```

Además, hay **13+ colores hardcodeados** dispersos en el mismo archivo (líneas 12, 17, 19, 24, 25, 30, 32, etc.) que no usan variables CSS, como `#071023`, `#081226`, `#e6eef6`, `#042016`, `#dbeafe`, `#134b3a`, `#d1d5db`, `#0f3e29`, `#083421`, `#dff7ea`.

**Consecuencia concreta:** La identidad visual actual (navy/verde) no corresponde con la paleta deseada (amarillo/negro). Cambiar solo las variables `:root` no es suficiente porque muchos colores están hardcodeados. No existen estados `:hover`, `:active` ni `:disabled` definidos para botones, lo que resulta en una experiencia interactiva incompleta.

## Goals / Non-Goals

### Goals

1. **Todos los fondos de la aplicación usan negro (`#000000`) o variantes oscuras cercanas** — verificable inspeccionando `body`, `.container`, `.msg.out`, `#processDef`.
2. **El color de acento primario es amarillo (`#FFD600`)** — verificable en `.primary` button background, `.widget-boolean .pill`, y links/acentos.
3. **Los botones `.primary` y `.pill` tienen estados `:hover`, `:active` y `:disabled` definidos** con variantes de la paleta amarillo/negro.
4. **Todos los textos mantienen ratio de contraste ≥ 4.5:1** contra su fondo (WCAG AA) — amarillo `#FFD600` sobre negro `#000000` tiene ratio 12.6:1; blanco `#FFFFFF` sobre negro tiene 21:1.
5. **Cero colores hardcodeados verdes/navy** permanecen en `style.css` — todos reemplazados por la nueva paleta.
6. **La aplicación se ve consistente** en todos los componentes: header, textarea, chat bubbles, pills, footer, scrollbar.

### Non-Goals

- **No se modifica la estructura HTML/JSX** — los archivos `src/App.jsx`, `src/main.jsx`, `index.html` no cambian (no tienen colores inline).
- **No se migra a CSS modules, Tailwind, ni otro framework CSS** — se mantiene el archivo `style.css` plano.
- **No se modifica `app.js`** — es el archivo legacy vanilla JS que no contiene estilos de color.
- **No se rediseña el layout** — solo cambian colores, no spacing, sizing ni tipografía.
- **No se agregan temas dinámicos ni dark/light mode toggle** — es un cambio estático de paleta.
- **No se regenera `dist/`** manualmente — se regenera con `npm run build`.

## Proposed Solution

### Architecture Overview

El cambio es enteramente en `style.css`. La estrategia es:

1. **Redefinir las CSS custom properties** en `:root` con la nueva paleta amarillo/negro.
2. **Agregar nuevas variables** para colores que actualmente están hardcodeados, centralizando todo en `:root`.
3. **Reemplazar todos los colores hardcodeados** en las reglas CSS por referencias a variables.
4. **Agregar reglas de estado** (`:hover`, `:active`, `:disabled`) para elementos interactivos.

```
┌─────────────────────────────────────────────┐
│  :root (Design Tokens)                      │
│  --bg: #000000          (negro puro)        │
│  --bg-elevated: #111111 (superficie elevada)│
│  --accent: #FFD600      (amarillo primario) │
│  --accent-hover: #E6C100(amarillo hover)    │
│  --accent-muted: #B39700(amarillo disabled) │
│  --text-primary: #FFFFFF(texto principal)   │
│  --text-secondary: #AAAAAA (texto muted)   │
│  --text-on-accent: #000000 (texto en botón) │
│  --border: rgba(255,255,255,0.08)           │
│  --glass: rgba(255,255,255,0.04)            │
│  --bubble-in: #1A1A00   (burbuja entrante) │
│  --bubble-in-end: #0D0D00                   │
│  --bubble-out: #111111  (burbuja saliente)  │
│  --shadow: rgba(0,0,0,0.6)                 │
│  --scrollbar: rgba(255,255,255,0.06)        │
└─────────────────────────────────────────────┘
         │
         ▼  Consumed by all CSS rules
┌─────────────────────────────────────────────┐
│  body, .container, .primary, .pill,         │
│  .msg.in, .msg.out, #processDef,            │
│  input, .meta, .footer, .status,            │
│  .widget-boolean .pill, scrollbar           │
└─────────────────────────────────────────────┘
```

### File Changes (exhaustive — list of EVERY file that will be modified)

| # | File | Action | Rationale |
|---|------|--------|-----------|
| 1 | `style.css` | **MODIFY** | Único archivo de estilos. Contiene todas las variables CSS y reglas de color. Se detallan los cambios línea por línea abajo. |

**Archivos que NO se modifican** (confirmado que no contienen colores inline):

| File | Razón de exclusión |
|------|-------------------|
| `src/App.jsx` | Solo usa `className` refs a CSS. Sus 2 inline `style=` (líneas 180, 183) son layout-only (`marginTop`, `display`, `flex`, `gap`, `alignItems`). Sin colores. |
| `src/main.jsx` | Solo importa `'/style.css'` y monta `<App />`. Sin colores. |
| `app.js` | Legacy vanilla JS. Sin colores inline (verificado por búsqueda). |
| `index.html` | Shell HTML. Solo `<link>` a `style.css`. Sin colores. |
| `vite.config.js` | Config de build/proxy. Sin estilos. |
| `package.json` | Metadatos del proyecto. Sin estilos. |
| `dist/*` | Output de build. Se regenera automáticamente con `npm run build`. |

---

### Cambios detallados en `style.css`

#### 1. REMOVE + ADD: Bloque `:root` (líneas 1-9)

**REMOVE** el bloque `:root` actual completo (líneas 1-9).

**ADD** nuevo bloque `:root` con tokens de diseño expandidos:

```css
:root {
  /* === Base / Backgrounds === */
  --bg: #000000;
  --bg-elevated: #111111;
  --card: #0A0A0A;
  --glass: rgba(255, 255, 255, 0.04);

  /* === Accent (Yellow) === */
  --accent: #FFD600;
  --accent-hover: #E6C100;
  --accent-active: #CCAB00;
  --accent-muted: rgba(255, 214, 0, 0.35);

  /* === Text === */
  --text-primary: #FFFFFF;
  --text-secondary: #AAAAAA;
  --text-on-accent: #000000;

  /* === Borders & Shadows === */
  --border: rgba(255, 255, 255, 0.08);
  --border-accent: rgba(255, 214, 0, 0.3);
  --shadow: rgba(0, 0, 0, 0.6);

  /* === Chat Bubbles === */
  --bubble-in: #1A1A00;
  --bubble-in-end: #0D0D00;
  --bubble-out: #111111;

  /* === Scrollbar === */
  --scrollbar-thumb: rgba(255, 255, 255, 0.06);

  /* === Muted (legacy alias) === */
  --muted: var(--text-secondary);
}
```

#### 2. MODIFY: `body` (línea 12)

- **ANTES:** `body{background:linear-gradient(180deg,#071023 0%, #081226 100%);color:#e6eef6}`
- **DESPUÉS:** `body{background:var(--bg);color:var(--text-primary)}`

#### 3. MODIFY: `.container` (línea 13)

- **ANTES:** `background:linear-gradient(180deg,rgba(255,255,255,0.02),transparent);box-shadow:0 6px 30px rgba(2,6,23,0.6)`
- **DESPUÉS:** `background:var(--bg-elevated);box-shadow:0 6px 30px var(--shadow)`

#### 4. MODIFY: `#processDef` (línea 17)

- **ANTES:** `border:1px solid rgba(255,255,255,0.04);background:var(--glass);color:#dbeafe`
- **DESPUÉS:** `border:1px solid var(--border);background:var(--glass);color:var(--text-primary)`

#### 5. MODIFY: `.primary` (línea 19)

- **ANTES:** `.primary{background:var(--accent);color:#042016;border:none;padding:10px 14px;border-radius:8px;cursor:pointer;font-weight:600}`
- **DESPUÉS:** `.primary{background:var(--accent);color:var(--text-on-accent);border:none;padding:10px 14px;border-radius:8px;cursor:pointer;font-weight:600;transition:background 0.15s ease}`

#### 6. ADD: Estados interactivos `.primary` (después de línea 19)

```css
.primary:hover{background:var(--accent-hover)}
.primary:active{background:var(--accent-active)}
.primary:disabled{background:var(--accent-muted);color:var(--text-secondary);cursor:not-allowed}
```

#### 7. MODIFY: `button` genérico (línea 20)

- **ANTES:** `button{padding:8px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.03);background:transparent;color:var(--muted);cursor:pointer}`
- **DESPUÉS:** `button{padding:8px 12px;border-radius:8px;border:1px solid var(--border);background:transparent;color:var(--text-secondary);cursor:pointer;transition:border-color 0.15s ease, color 0.15s ease}`

#### 8. ADD: Estados interactivos `button` (después de línea 20)

```css
button:hover{border-color:var(--accent);color:var(--accent)}
button:active{border-color:var(--accent-hover);color:var(--accent-hover)}
button:disabled{border-color:var(--border);color:rgba(255,255,255,0.2);cursor:not-allowed}
```

#### 9. MODIFY: `.msg` box-shadow (línea 23)

- **ANTES:** `box-shadow:0 4px 14px rgba(2,6,23,0.5)`
- **DESPUÉS:** `box-shadow:0 4px 14px var(--shadow)`

#### 10. MODIFY: `.msg.in` (línea 24)

- **ANTES:** `.msg.in{background:linear-gradient(180deg,var(--bubble-in),#134b3a);align-self:flex-start}`
- **DESPUÉS:** `.msg.in{background:linear-gradient(180deg,var(--bubble-in),var(--bubble-in-end));align-self:flex-start;border:1px solid var(--border-accent)}`

#### 11. MODIFY: `.msg.out` (línea 25)

- **ANTES:** `.msg.out{background:var(--bubble-out);color:#d1d5db;align-self:flex-end}`
- **DESPUÉS:** `.msg.out{background:var(--bubble-out);color:var(--text-secondary);align-self:flex-end}`

#### 12. MODIFY: `.pill` (línea 28)

- **ANTES:** `.pill{padding:8px 12px;border-radius:999px;background:rgba(0,0,0,0.18);border:1px solid rgba(255,255,255,0.03);cursor:pointer}`
- **DESPUÉS:** `.pill{padding:8px 12px;border-radius:999px;background:rgba(255,214,0,0.1);border:1px solid var(--border-accent);color:var(--accent);cursor:pointer;transition:background 0.15s ease}`

#### 13. ADD: Estados interactivos `.pill` (después de línea 28)

```css
.pill:hover{background:rgba(255,214,0,0.2)}
.pill:active{background:rgba(255,214,0,0.3)}
```

#### 14. MODIFY: `input[type=text], textarea.short` (línea 30)

- **ANTES:** `border:1px solid rgba(255,255,255,0.04);background:transparent;color:#e6eef6`
- **DESPUÉS:** `border:1px solid var(--border);background:transparent;color:var(--text-primary)`

#### 15. ADD: Estado focus para inputs (después de línea 30)

```css
input[type=text]:focus, textarea.short:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-muted)}
```

#### 16. MODIFY: `.widget-boolean .pill` (línea 32)

- **ANTES:** `.widget-boolean .pill{background:linear-gradient(180deg,#0f3e29,#083421);color:#dff7ea}`
- **DESPUÉS:** `.widget-boolean .pill{background:linear-gradient(180deg,rgba(255,214,0,0.15),rgba(255,214,0,0.05));color:var(--accent)}`

#### 17. MODIFY: Scrollbar thumb (línea 37)

- **ANTES:** `.chat::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.04);border-radius:999px}`
- **DESPUÉS:** `.chat::-webkit-scrollbar-thumb{background:var(--scrollbar-thumb);border-radius:999px}`

### Key New Code

**Nuevo bloque `:root` completo** (reemplaza líneas 1-9 de `style.css`):

```css
:root {
  --bg: #000000;
  --bg-elevated: #111111;
  --card: #0A0A0A;
  --glass: rgba(255, 255, 255, 0.04);
  --accent: #FFD600;
  --accent-hover: #E6C100;
  --accent-active: #CCAB00;
  --accent-muted: rgba(255, 214, 0, 0.35);
  --text-primary: #FFFFFF;
  --text-secondary: #AAAAAA;
  --text-on-accent: #000000;
  --border: rgba(255, 255, 255, 0.08);
  --border-accent: rgba(255, 214, 0, 0.3);
  --shadow: rgba(0, 0, 0, 0.6);
  --bubble-in: #1A1A00;
  --bubble-in-end: #0D0D00;
  --bubble-out: #111111;
  --scrollbar-thumb: rgba(255, 255, 255, 0.06);
  --muted: var(--text-secondary);
}
```

**Patrón de estados interactivos para botones** (nuevo, no existía previamente):

```css
.primary:hover { background: var(--accent-hover) }
.primary:active { background: var(--accent-active) }
.primary:disabled { background: var(--accent-muted); color: var(--text-secondary); cursor: not-allowed }

button:hover { border-color: var(--accent); color: var(--accent) }
button:active { border-color: var(--accent-hover); color: var(--accent-hover) }
button:disabled { border-color: var(--border); color: rgba(255,255,255,0.2); cursor: not-allowed }
```

### Constructor / Initialization Changes

No aplica — no hay cambios en JavaScript/JSX. Los archivos `src/App.jsx`, `src/main.jsx`, `app.js`, `index.html` y `vite.config.js` permanecen sin modificaciones. El import `import '/style.css'` en `src/main.jsx` (línea 4) y el `<link rel="stylesheet" href="/style.css">` en `index.html` (línea 7) siguen funcionando sin cambios.

### Mapeo completo de colores: Antes → Después

| Ubicación | Color Antes | Color Después | Variable CSS |
|---|---|---|---|
| `:root --bg` | `#0f1724` | `#000000` | `--bg` |
| `:root --card` | `#0b1220` | `#0A0A0A` | `--card` |
| `:root --accent` | `#6ee7b7` (verde) | `#FFD600` (amarillo) | `--accent` |
| `:root --muted` | `#9aa4b2` | `#AAAAAA` | `--muted` (alias de `--text-secondary`) |
| `:root --bubble-in` | `#0b6e4f` | `#1A1A00` | `--bubble-in` |
| `:root --bubble-out` | `#1f2937` | `#111111` | `--bubble-out` |
| `body` background | `#071023`→`#081226` gradient | `#000000` sólido | `--bg` |
| `body` color | `#e6eef6` | `#FFFFFF` | `--text-primary` |
| `.primary` text color | `#042016` | `#000000` | `--text-on-accent` |
| `#processDef` color | `#dbeafe` | `#FFFFFF` | `--text-primary` |
| `#processDef` border | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.08)` | `--border` |
| `.msg.in` gradient end | `#134b3a` | `#0D0D00` | `--bubble-in-end` |
| `.msg.out` color | `#d1d5db` | `#AAAAAA` | `--text-secondary` |
| `input` color | `#e6eef6` | `#FFFFFF` | `--text-primary` |
| `input` border | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.08)` | `--border` |
| `.widget-boolean .pill` bg | `#0f3e29`→`#083421` gradient | amarillo gradient | `rgba(255,214,0,...)` |
| `.widget-boolean .pill` color | `#dff7ea` | `#FFD600` | `--accent` |
| `.container` box-shadow | `rgba(2,6,23,0.6)` | `rgba(0,0,0,0.6)` | `--shadow` |
| `.msg` box-shadow | `rgba(2,6,23,0.5)` | `rgba(0,0,0,0.6)` | `--shadow` |
| button border | `rgba(255,255,255,0.03)` | `rgba(255,255,255,0.08)` | `--border` |
| scrollbar thumb | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.06)` | `--scrollbar-thumb` |

## Migration Plan

### Paso 1: Modificar `style.css`
Reemplazar el contenido completo de `style.css` aplicando todos los 17 cambios detallados en la sección "Cambios detallados en `style.css`". Este es un cambio atómico en un solo archivo.

### Paso 2: Verificación visual en dev
```bash
npm run dev
```
Abrir `http://localhost:5174` y verificar:
- [ ] Fondo de `body` es negro puro
- [ ] Fondo de `.container` es `#111111` (gris muy oscuro)
- [ ] Botón "Execute" tiene fondo amarillo `#FFD600` con texto negro
- [ ] Hover sobre "Execute" oscurece a `#E6C100`
- [ ] Botón "Fetch Inbox" tiene borde que se vuelve amarillo en hover
- [ ] Textarea `#processDef` tiene borde sutil y texto blanco
- [ ] Texto del header es blanco, subtítulo es gris `#AAAAAA`
- [ ] Footer es gris `#AAAAAA`
- [ ] Pills ("Aceptar", "Rechazar", "Enviar") tienen tinte amarillo
- [ ] Mensajes entrantes (`.msg.in`) tienen tinte amarillo oscuro sutil con borde amarillo
- [ ] Mensajes salientes (`.msg.out`) tienen fondo `#111111`
- [ ] Scrollbar del chat es visible pero sutil
- [ ] Focus en inputs muestra borde amarillo con glow sutil

### Paso 3: Verificar responsive
- [ ] En viewport ≤640px, los mensajes ocupan hasta 92% del ancho (regla `@media` existente en línea 39, no se modifica)
- [ ] Los colores se ven correctos en mobile

### Paso 4: Rebuild de producción
```bash
npm run build
```
Verificar que `dist/assets/index-*.css` contiene los nuevos colores.

### Paso 5: Verificar contraste
Usar herramienta de contraste (Chrome DevTools Accessibility o WebAIM Contrast Checker):
- [ ] `#FFD600` sobre `#000000` → ratio 12.6:1 (pasa AAA)
- [ ] `#FFFFFF` sobre `#000000` → ratio 21:1 (pasa AAA)
- [ ] `#AAAAAA` sobre `#000000` → ratio 7.4:1 (pasa AA)
- [ ] `#000000` sobre `#FFD600` → ratio 12.6:1 (pasa AAA)

## Risks

1. **`app.js` legacy no se actualiza**: El archivo `app.js` (230 líneas) es una versión vanilla JS que no se usa en la app React (el entry point es `src/main.jsx`). Sin embargo, si alguien lo usa directamente con un HTML diferente, vería los mismos estilos porque comparte `style.css`. **Mitigación**: `app.js` no contiene colores inline, así que el cambio en `style.css` lo cubre automáticamente.

2. **Contraste de `.msg.in` con borde amarillo**: El borde `border-accent` (`rgba(255,214,0,0.3)`) sobre fondo negro podría ser demasiado sutil. **Mitigación**: Verificar visualmente; si es insuficiente, aumentar opacidad a `0.5`.

3. **Gradientes en `.container`**: Se reemplaza el gradiente sutil por un color sólido `#111111`. Esto simplifica pero pierde el efecto glass. **Mitigación**: Si se desea mantener el efecto, usar `background:linear-gradient(180deg,rgba(255,214,0,0.02),var(--bg-elevated))`.

4. **Build cache de Vite**: Los archivos en `dist/` tienen hashes en el nombre (`index-Cl39OLgr.css`). Después del rebuild, los hashes cambiarán automáticamente, invalidando cache. No se requiere acción manual.

5. **Especificidad CSS de estados `:hover` en `.primary` vs `button`**: `.primary` extiende `button`. Los estados `button:hover` podrían competir con `.primary:hover`. **Mitigación**: `.primary:hover` tiene mayor especificidad por la clase, así que gana correctamente. Verificar en DevTools.

## Open Questions

1. **¿Se desea mantener el gradiente sutil en `body` o usar negro sólido?** La spec propone negro sólido (`#000000`) para máxima consistencia, pero un gradiente sutil `#000000` → `#0A0A00` podría dar más profundidad visual.

2. **¿El amarillo exacto debe ser `#FFD600` o se acepta `#FFC107` (Material Amber) u otro tono?** La spec usa `#FFD600` según el brief, pero el equipo de diseño podría preferir un tono ligeramente diferente. Todos los colores derivados (hover, active, muted) se ajustarían proporcionalmente.

3. **¿Se requiere un favicon o meta `theme-color` actualizado para reflejar la nueva paleta?** Actualmente no hay favicon ni `<meta name="theme-color">` en `index.html`. Agregar `<meta name="theme-color" content="#000000">` mejoraría la experiencia en mobile pero está fuera del scope de CSS.