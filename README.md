# 🔥 BURN GT — Rutina Quema Grasa

> Herramientas de entrenamiento personal para quemar grasa. 7 días activos, gym + casa, 90 min/sesión.

**[→ Ver en vivo](https://TU-USUARIO.github.io/burn-gt/)**

---

## Apps incluidas

| App | Descripción |
|-----|-------------|
| [Rutina 7 Días](apps/rutina.html) | Plan completo con supersets, HIIT, videos de técnica, errores comunes y timer automático |
| [Coach Semanal](apps/coach.html) | Plan original gym/casa alternando con las 3 reglas de oro |

---

## Estructura del repo

```
burn-gt/
├── index.html          ← Landing page principal
├── apps/
│   ├── rutina.html     ← Rutina 7 días quema grasa
│   └── coach.html      ← Coach semanal original
└── README.md
```

---

## Cómo publicar en GitHub Pages

### Opción A — GitHub Web (más fácil)

1. Ir a [github.com/new](https://github.com/new)
2. Nombre del repo: `burn-gt`
3. Marcar como **Public**
4. Click en **Create repository**
5. En la pantalla siguiente, click en **uploading an existing file**
6. Arrastrar los 3 archivos:
   - `index.html`
   - `apps/coach.html`
   - `apps/rutina.html`

   > ⚠️ Subir `coach.html` y `rutina.html` dentro de una carpeta `apps/`

7. Click **Commit changes**
8. Ir a **Settings → Pages**
9. Source: **Deploy from a branch** → Branch: `main` → Folder: `/ (root)`
10. Click **Save**
11. En 1-2 minutos el sitio estará en: `https://TU-USUARIO.github.io/burn-gt/`

---

### Opción B — Git CLI

```bash
# 1. Clonar o inicializar
git init
git add .
git commit -m "feat: initial BURN GT release"

# 2. Conectar con GitHub
git remote add origin https://github.com/TU-USUARIO/burn-gt.git
git branch -M main
git push -u origin main

# 3. Activar Pages en Settings → Pages → main / root
```

---

## El plan de entrenamiento

| Día | Tipo | Enfoque | Duración |
|-----|------|---------|----------|
| Lunes | 🏛️ Gym | Tren Superior — Supersets Push/Pull | 90 min |
| Martes | 🔥 Casa | HIIT Full Body — Tabata + Core | 45 min |
| Miércoles | 🏛️ Gym | Tren Inferior — Sentadilla, Prensa, Hip Thrust | 90 min |
| Jueves | 🔥 Casa | Cardio HIIT + Core pesado | 45 min |
| Viernes | 🏛️ Gym | Hombros completo + Ab Wheel + Sprints | 90 min |
| Sábado | 🏛️ Gym | Full Body Metabólico — Peso muerto, Dominadas | 90 min |
| Domingo | 🧘 Activo | Movilidad, estiramiento, caminata | 30 min |

---

## Features

- ✅ **Sin dependencias** — HTML/CSS/JS puro, sin frameworks
- ✅ **Offline-friendly** — funciona sin internet (excepto videos YouTube)
- ✅ **Progreso guardado** — localStorage por semana
- ✅ **Timer automático** — se activa al completar cada ejercicio
- ✅ **Videos de técnica** — YouTube embebido por ejercicio
- ✅ **Errores comunes** — qué NO hacer en cada movimiento
- ✅ **Responsive** — optimizado para celular

---

*Hecho en Guatemala 🇬🇹*
