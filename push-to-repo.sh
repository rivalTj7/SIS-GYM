#!/bin/bash
# =============================================================
# BURN GT PRO — Script para actualizar el repo SIS-GYM
# Ejecuta esto desde la raíz del repositorio clonado
# =============================================================

# 1. Clonar (si no lo tenés)
# git clone https://github.com/rivalTj7/SIS-GYM.git
# cd SIS-GYM

# 2. Descargar el ZIP burn-gt-next.zip y descomprimir
# unzip burn-gt-next.zip

# 3. Copiar todos los archivos nuevos al repo
echo "Copiando archivos nuevos..."

# API routes
mkdir -p app/api/auth/login app/api/auth/logout app/api/auth/me app/api/auth/register
mkdir -p app/api/exercises
mkdir -p app/api/nutrition/estimate
mkdir -p app/api/progress
mkdir -p app/api/weight
mkdir -p app/api/workouts/\[id\]
mkdir -p hooks lib components/ui

# (asumiendo que descomprimiste burn-gt-next/ en la misma carpeta)
cp -r burn-gt-next/app/api/ app/
cp -r burn-gt-next/app/page.tsx app/page.tsx
cp -r burn-gt-next/app/layout.tsx app/layout.tsx
cp -r burn-gt-next/app/globals.css app/globals.css
cp -r burn-gt-next/hooks/ hooks/
cp -r burn-gt-next/lib/ lib/
cp burn-gt-next/schema.sql schema.sql
cp burn-gt-next/tailwind.config.ts tailwind.config.ts
cp burn-gt-next/package.json package.json
cp burn-gt-next/README.md README.md

# 4. Agregar y commitear
git add .
git status

echo ""
echo "Si todo se ve bien, ejecuta:"
echo "  git commit -m 'feat: full BURN GT PRO — AI macros, Neon DB, PPL+Arnold split, gym/casa modal'"
echo "  git push origin main"
