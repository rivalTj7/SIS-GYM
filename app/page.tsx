'use client';
import { useState, useEffect, useCallback, useRef } from 'react';

// ── Types ──────────────────────────────────────────────────
type User = { id: string; email: string; name: string };
type Profile = { tdee: number; goal_kcal: number; goal_prot: number; goal_carb: number } | null;
type FoodLog = { id: string; food_name: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number; meal_type: string };
type WeightLog = { id: string; weight_kg: number; logged_at: string };
type Session = { id: string; day_key: string; split_type: string; mode: 'gym' | 'casa'; completed: boolean };
type FoodEstimate = {
  food_name: string; serving_description: string; kcal: number;
  protein_g: number; carbs_g: number; fat_g: number;
  confidence: string; notes: string;
  items: Array<{ name: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number }>;
};

// ── Constants ──────────────────────────────────────────────
const TODAY = new Date().toISOString().slice(0, 10);
const DAY_IDX = (new Date().getDay() + 6) % 7;


// ================================================================
// BURN GT PRO — PLAN ATLÉTICO PERSONALIZADO
// Perfil: Principiante | 26-32 años | Sobrepeso moderado con base
// Objetivo: Físico atlético funcional (fuerza + definición)
// Split: Upper/Lower × 2 + Full Body funcional (6 días)
// Metodología: Recomposición corporal — déficit moderado + fuerza
//
// LUNES:   Upper A (Empuje dominante — Pecho + Hombros + Tríceps)
// MARTES:  Lower A (Cuádriceps dominante — Sentadilla + Glúteo)
// MIÉRC:   Upper B (Tracción dominante — Espalda + Bíceps)
// JUEVES:  Lower B (Isquio/Glúteo dominante — Peso muerto + Cadera)
// VIERNES: Full Body Potencia (Compuestos pesados + Cardio HIIT)
// SÁBADO:  Upper Volumen (Hombros + Brazos + Core intenso)
// DOMINGO: Descanso activo
//
// PRINCIPIOS APLICADOS:
// - Frecuencia 2x por músculo (mayor síntesis proteica semanal)
// - Progresión doble: +1 rep cada sesión, +2.5kg cada 2 semanas
// - RIR 3-4 las primeras 2 semanas, luego RIR 1-2
// - Tempo controlado en excéntrico (3 seg bajando)
// - Cardio integrado en el entrenamiento (HIIT post-fuerza)
// ================================================================


// ================================================================
// BURN GT PRO — RUTINA 6 DÍAS (PHUL ADAPTADO 6 DÍAS)
// Basada en Power Hypertrophy Upper Lower (Brandon Campbell)
// Adaptada para 6 días, principiante-intermedio, físico atlético
//
// SPLIT:
// LUN: Pecho + Hombros + Tríceps (Empuje A)
// MAR: Espalda + Bíceps + Antebrazo (Tracción A)
// MIÉ: Piernas + Glúteos (Pierna A)
// JUE: Pecho + Hombros + Tríceps (Empuje B — variantes)
// VIE: Espalda + Bíceps (Tracción B — variantes)
// SÁB: Piernas + Core (Pierna B + Core)
// DOM: Descanso
//
// ESTRUCTURA DE CADA EJERCICIO:
// - Nombre exacto
// - Series × Reps (ej: 4 × 8–12)
// - Descanso entre series
// - Video YouTube ID
// - Tip técnico (1 línea, directo)
// ================================================================

const PLAN = [

// ════════════════════════════════════════════
// LUNES — EMPUJE A
// Pecho · Hombros · Tríceps
// ════════════════════════════════════════════
{
  day: 'LUN', label: 'PECHO · HOMBROS · TRÍCEPS', rest: false, split: 'pushA',
  gym: {
    focus: 'Pecho · Hombros · Tríceps',
    blocks: [
      {
        t: 'PECHO', s: false, e: [
          { n: 'Press de Banca con Barra',          sets: '4', reps: '5–6',   rs: 180, v: 'rT7DgCr-3pg', tip: 'Escápulas retraídas todo el tiempo. Barra baja hasta rozar el pecho. Empuje explosivo.', er: [{l:'❌',t:'Rebotar la barra en el pecho'},{l:'❌',t:'Nalgas despegadas del banco'}] },
          { n: 'Press Inclinado con Mancuernas',    sets: '4', reps: '8–10',  rs: 90,  v: '8iPEnn-ltC8', tip: 'Banco a 30°. Baja hasta sentir el estiramiento del pecho. No rebotes abajo.', er: [{l:'❌',t:'Banco a 45° o más → activa más hombro que pecho'}] },
          { n: 'Aperturas en Cable (Pec Deck)',      sets: '3', reps: '12–15', rs: 60,  v: 'rT7DgCr-3pg', tip: 'Movimiento de abrazo. Énfasis en el estiramiento. No uses momentum.', er: [] },
          { n: 'Pullover con Mancuerna',             sets: '3', reps: '12',    rs: 60,  v: 'FK4jEXqJHZA', tip: 'Brazos casi rectos. Baja detrás de la cabeza hasta sentir el dorsal y pecho. Sube exhalando.', er: [] },
        ]
      },
      {
        t: 'HOMBROS', s: false, e: [
          { n: 'Press Arnold con Mancuernas',       sets: '3', reps: '10–12', rs: 75,  v: 'qEwKCR5JCog', tip: 'Empieza palmas hacia ti. Gira al subir. Trabaja las 3 cabezas del deltoides.', er: [{l:'❌',t:'Arquearse hacia atrás al empujar'}] },
          { n: 'Elevaciones Laterales en Polea',    sets: '4', reps: '15–20', rs: 45,  v: 'FeJbvGm_09k', tip: 'Sube hasta paralelo, no más. Baja en 2 seg. La polea da tensión constante.', er: [{l:'❌',t:'Subir más allá del paralelo → impingement'}] },
          { n: 'Pájaros (Reverse Fly Inclinado)',   sets: '3', reps: '15',    rs: 45,  v: 'HSoHeSjvIdY', tip: 'Torso paralelo al suelo. Codos ligeramente doblados. Activa el deltoides posterior.', er: [] },
        ]
      },
      {
        t: 'TRÍCEPS', s: false, e: [
          { n: 'Extensión en Polea (cuerda)',        sets: '3', reps: '12–15', rs: 60,  v: 'vB5OHsJ3EMc', tip: 'Codos fijos al cuerpo. Separa la cuerda al final para máxima contracción.', er: [{l:'❌',t:'Codos que se mueven hacia adelante'}] },
          { n: 'Press Francés con Barra EZ',         sets: '3', reps: '10–12', rs: 60,  v: 'vB5OHsJ3EMc', tip: 'Codos apuntan al techo. Baja hasta la frente. No te golpees.', er: [{l:'❌',t:'Codos que se abren hacia los lados'}] },
        ]
      },
    ]
  },
  casa: {
    focus: 'Pecho · Hombros · Tríceps (sin equipamiento)',
    blocks: [
      {
        t: 'PECHO', s: false, e: [
          { n: 'Flexiones con Pausa (3-1-1)',         sets: '4', reps: '10–15', rs: 90, v: 'IODxDxX7oi4', tip: 'Baja en 3 seg, pausa 1 seg, explota al subir. Cuerpo recto como tabla.', er: [{l:'❌',t:'Cadera arriba o abajo'}] },
          { n: 'Flexiones Inclinadas (pies en silla)', sets: '4', reps: '10–12', rs: 75, v: 'IODxDxX7oi4', tip: 'Pies en silla a 45-50cm. Trabaja el pecho superior igual que press inclinado.', er: [] },
          { n: 'Aperturas con Botellas (suelo)',       sets: '3', reps: '15',    rs: 60, v: 'rT7DgCr-3pg', tip: 'Acostado en el suelo. Abre hasta casi tocar el suelo. Énfasis en el estiramiento.', er: [] },
        ]
      },
      {
        t: 'HOMBROS', s: false, e: [
          { n: 'Pike Push-ups (pies elevados)',        sets: '4', reps: '10–12', rs: 75, v: 'sposDXWEB0A', tip: 'Caderas bien altas en V invertida. Cabeza baja entre los brazos. = Press militar.', er: [] },
          { n: 'Elevaciones Laterales con Botellas',  sets: '4', reps: '20',    rs: 45, v: 'FeJbvGm_09k', tip: 'Botellas 1.5L. Sube hasta paralelo. Baja en 2 seg. 20 reps compensan el peso bajo.', er: [] },
        ]
      },
      {
        t: 'TRÍCEPS', s: false, e: [
          { n: 'Dips en Silla',                       sets: '3', reps: '12–15', rs: 60, v: 'l4kQd9eWclE', tip: 'Cuerpo vertical. Baja hasta 90°. Para tríceps: no te inclines hacia adelante.', er: [] },
          { n: 'Extensión Overhead con Mochila',      sets: '3', reps: '12',    rs: 60, v: 'vB5OHsJ3EMc', tip: 'Mochila con libros detrás de la cabeza. Codos apuntan al techo. Baja completo.', er: [] },
        ]
      },
    ]
  }
},

// ════════════════════════════════════════════
// MARTES — TRACCIÓN A
// Espalda · Bíceps · Antebrazo
// ════════════════════════════════════════════
{
  day: 'MAR', label: 'ESPALDA · BÍCEPS · ANTEBRAZO', rest: false, split: 'pullA',
  gym: {
    focus: 'Dorsal · Trapecio · Romboides · Bíceps · Antebrazo',
    blocks: [
      {
        t: 'ESPALDA', s: false, e: [
          { n: 'Dominadas al Fallo (o Jalón al pecho)', sets: '4', reps: 'al fallo (mín 4)', rs: 180, v: 'eGo4IYlbE5g', tip: 'Si podés hacer +8 dominadas: añade lastre. Baja hasta extensión completa. Pecho al bar.', er: [{l:'❌',t:'Balancearse para subir'},{l:'❌',t:'No llegar a extensión completa abajo'}] },
          { n: 'Jalón tras nuca',                        sets: '3', reps: '10–12',        rs: 75,  v: 'CAwf7n6Luuc', tip: 'Agarre ancho. Baja hasta tocar la nuca. Codos apuntan al suelo. Contrae la espalda.', er: [{l:'⚠️',t:'Si tenés molestia cervical usa jalón al pecho'}] },
          { n: 'Remo con Barra (Bent-Over Row)',         sets: '4', reps: '8–10',          rs: 90,  v: 'GZbfZ033f74', tip: 'Torso a 45°. Barra toca el abdomen bajo. No uses impulso del torso.', er: [{l:'❌',t:'Torso que sube y baja para generar inercia'}] },
          { n: 'Pullover con Mancuerna',                 sets: '3', reps: '12',            rs: 60,  v: 'FK4jEXqJHZA', tip: 'Brazos casi rectos. Baja detrás de la cabeza. Siente el estiramiento del dorsal.', er: [] },
        ]
      },
      {
        t: 'BÍCEPS', s: false, e: [
          { n: 'Curl Inclinado con Mancuernas',          sets: '3', reps: '10–12', rs: 75,  v: 'av7-8igSXTs', tip: 'Banco a 45°. Brazos cuelgan. Máximo estiramiento del bíceps al inicio.', er: [] },
          { n: 'Curl Martillo con Mancuernas',           sets: '3', reps: '10–12', rs: 60,  v: 'TwD-YGVP4Bk', tip: 'Agarre neutro. Trabaja el braquial = más grosor al brazo. Codos fijos.', er: [] },
          { n: 'Curl Concentrado con Mancuerna',         sets: '3', reps: '12',    rs: 45,  v: 'BZFgeQfOCGE', tip: 'Codo apoyado en la rodilla. Aislamiento total del bíceps. Contrae 1 seg arriba.', er: [] },
        ]
      },
      {
        t: 'ANTEBRAZO', s: false, e: [
          { n: 'Curl de Muñeca con Barra (supinación)',  sets: '3', reps: '15–20', rs: 45, v: 'TwD-YGVP4Bk', tip: 'Antebrazos apoyados en el banco. Solo se mueve la muñeca hacia arriba.', er: [] },
          { n: 'Curl de Muñeca Inverso (pronación)',     sets: '3', reps: '15–20', rs: 45, v: 'TwD-YGVP4Bk', tip: 'Mismo movimiento pero con el dorso hacia arriba. Trabaja el extensor.', er: [] },
        ]
      },
    ]
  },
  casa: {
    focus: 'Espalda · Bíceps · Antebrazo (con mochila)',
    blocks: [
      {
        t: 'ESPALDA', s: false, e: [
          { n: 'Dominadas (si tenés barra) o Inverted Row', sets: '4', reps: 'al fallo / 12', rs: 120, v: 'eGo4IYlbE5g', tip: 'Dominadas > jalón > inverted row. Usa lo que tenés disponible. Rango completo siempre.', er: [] },
          { n: 'Remo con Mochila (unilateral)',              sets: '4', reps: '12 × lado',    rs: 75,  v: 'roCP6wCXPqo', tip: 'Mochila con libros. Codo hacia el techo. Contrae la espalda 1 seg en el tope.', er: [] },
          { n: 'Superman con Pausa',                         sets: '3', reps: '15',           rs: 45,  v: 'z6PJMT2y8GQ', tip: 'Boca abajo. Sube brazos y piernas. Mantén 2 seg. Activa toda la cadena posterior.', er: [] },
        ]
      },
      {
        t: 'BÍCEPS + ANTEBRAZO', s: false, e: [
          { n: 'Curl con Mochila (supino)',    sets: '3', reps: '12–15', rs: 60, v: 'av7-8igSXTs', tip: 'Codos fijos. Gira la muñeca al subir. Baja en 3 seg para más estímulo.', er: [] },
          { n: 'Curl Inverso con Botella',     sets: '3', reps: '15–20', rs: 45, v: 'TwD-YGVP4Bk', tip: 'Agarre con el dorso hacia arriba. Trabaja el braquiorradial y los extensores.', er: [] },
        ]
      },
    ]
  }
},

// ════════════════════════════════════════════
// MIÉRCOLES — PIERNA A
// Sentadilla · Cuádriceps · Glúteos · Pantorrillas
// ════════════════════════════════════════════
{
  day: 'MIÉ', label: 'PIERNAS · GLÚTEOS · PANTORRILLAS', rest: false, split: 'legA',
  gym: {
    focus: 'Cuádriceps · Glúteos · Pantorrillas',
    blocks: [
      {
        t: 'PIERNA', s: false, e: [
          { n: 'Sentadilla con Barra',           sets: '4', reps: '5–8',   rs: 180, v: 'ultWZbUMPL8', tip: 'Pecho arriba, rodillas siguen la dirección de los pies. Baja hasta paralelo o más.', er: [{l:'❌',t:'Rodillas que colapsan hacia adentro'},{l:'❌',t:'Espalda redondeada al bajar'}] },
          { n: 'Peso Muerto con Barra',          sets: '4', reps: '5–6',   rs: 180, v: 'op9kVnSso6Q', tip: 'Espalda NEUTRA. Barra pegada al cuerpo todo el tiempo. Empuja el suelo, no jales.', er: [{l:'❌',t:'Espalda redondeada → riesgo de hernia'},{l:'❌',t:'Barra que se separa del cuerpo'}] },
          { n: 'Elevación de Talones de Pie',    sets: '3', reps: '15',    rs: 60,  v: 'gwLzBJYoWlQ', tip: 'Barra sobre los hombros. Sube a la máxima punta. Baja el talón por debajo del nivel.', er: [{l:'❌',t:'Rango parcial — sin rango completo no hay crecimiento'}] },
        ]
      },
      {
        t: 'CUÁDRICEPS + GLÚTEOS', s: false, e: [
          { n: 'Prensa de Piernas',              sets: '4', reps: '10–12', rs: 90,  v: 'GvRgijoJ2xY', tip: 'Pies al ancho de hombros. Baja hasta 90°. No despegues la espalda baja.', er: [{l:'❌',t:'Bloquear las rodillas arriba'}] },
          { n: 'Hip Thrust con Barra',           sets: '4', reps: '10–12', rs: 90,  v: 'SEdqd1n0cvg', tip: 'Espalda sobre el banco. Empuja desde los talones. Contrae el glúteo 2 seg arriba.', er: [{l:'❌',t:'Hiperextender la espalda baja arriba'}] },
        ]
      },
      {
        t: 'TRAPECIO', s: false, e: [
          { n: 'Encogimientos con Mancuernas',       sets: '3', reps: '12',    rs: 60, v: 'qEwKCR5JCog', tip: 'Sube los hombros al máximo. Mantén 1 seg arriba. Baja controlado. No gires el cuello.', er: [] },
          { n: 'Encogimientos Traseros con Barra',   sets: '3', reps: '12',    rs: 60, v: 'qEwKCR5JCog', tip: 'Barra detrás del cuerpo. Encoge los hombros hacia las orejas. Activa más el trapecio.', er: [] },
          { n: 'Encogimientos Inclinado con Barra',  sets: '3', reps: '12',    rs: 60, v: 'qEwKCR5JCog', tip: 'Torso inclinado hacia adelante ~30°. Activa la parte media del trapecio.', er: [] },
        ]
      },
    ]
  },
  casa: {
    focus: 'Piernas · Glúteos · Pantorrillas (sin equipamiento)',
    blocks: [
      {
        t: 'PIERNA', s: false, e: [
          { n: 'Sentadilla Búlgara',               sets: '4', reps: '10 × pierna', rs: 90, v: 'QOVaHwm-Q6U', tip: 'Pie trasero en silla. Baja verticalmente. Para más glúteo: inclina el torso al frente.', er: [{l:'❌',t:'Rodilla delantera pasa los dedos del pie lateralmente'}] },
          { n: 'Hip Thrust Elevado (sofá)',         sets: '4', reps: '15–20',       rs: 75, v: 'OUgsJ8-Vi0E', tip: 'Hombros en el borde del sofá. Talones en el suelo. Pausa 2 seg arriba. Empuja con los talones.', er: [] },
          { n: 'Sentadilla con Salto',              sets: '4', reps: '15',          rs: 60, v: 'CVaEhXotL7M', tip: 'Profundidad completa. Explota. Aterriza con rodillas dobladas.', er: [] },
        ]
      },
      {
        t: 'TRAPECIO + PANTORRILLAS', s: false, e: [
          { n: 'Encogimientos con Mochila',      sets: '3', reps: '15', rs: 45, v: 'qEwKCR5JCog', tip: 'Mochila pesada en cada mano. Sube los hombros al máximo. Pausa 1 seg.', er: [] },
          { n: 'Pantorrillas en Escalón',        sets: '4', reps: '20', rs: 30, v: 'gwLzBJYoWlQ', tip: 'Rango completo: talón abajo del borde, punta al máximo arriba. Pausa 2 seg arriba.', er: [] },
        ]
      },
    ]
  }
},

// ════════════════════════════════════════════
// JUEVES — EMPUJE B
// Pecho plano + declinado · Hombros · Tríceps (variantes)
// ════════════════════════════════════════════
{
  day: 'JUE', label: 'PECHO · HOMBROS · TRÍCEPS (B)', rest: false, split: 'pushB',
  gym: {
    focus: 'Pecho plano y declinado · Hombros · Tríceps',
    blocks: [
      {
        t: 'PECHO', s: false, e: [
          { n: 'Press Banca Inclinado con Barra',     sets: '4', reps: '8–12',  rs: 120, v: '8iPEnn-ltC8', tip: 'Banco 30°. Agarre ligeramente más ancho que los hombros. Barra baja a la parte alta del pecho.', er: [{l:'❌',t:'Banco a más de 45° → activa hombro, no pecho superior'}] },
          { n: 'Press Banca Plano con Mancuernas',    sets: '4', reps: '10–12', rs: 90,  v: 'rT7DgCr-3pg', tip: 'Mayor rango de movimiento que la barra. Baja hasta sentir el estiramiento completo del pecho.', er: [] },
          { n: 'Aperturas Planas con Mancuernas',     sets: '4', reps: '12',    rs: 60,  v: 'rT7DgCr-3pg', tip: 'Codos ligeramente doblados. Estiramiento máximo abajo. No uses mucho peso.', er: [{l:'❌',t:'Codos completamente rectos → tensión en el bíceps'}] },
          { n: 'Press Banca Declinado',               sets: '3', reps: '12',    rs: 75,  v: 'rT7DgCr-3pg', tip: 'Activa el pecho inferior. Declive de 15-30°. Agarre normal. Baja hasta el pecho bajo.', er: [] },
        ]
      },
      {
        t: 'HOMBROS', s: false, e: [
          { n: 'Press Arnold con Mancuernas',         sets: '3', reps: '10–12', rs: 75, v: 'qEwKCR5JCog', tip: 'Misma técnica que el lunes. La repetición de este ejercicio 2× semana construye hombros rápido.', er: [] },
          { n: 'Elevaciones Laterales con Mancuernas', sets: '3', reps: '12–15', rs: 45, v: 'FeJbvGm_09k', tip: 'Variación a la polea del lunes. Sube hasta paralelo. Baja en 2 seg.', er: [] },
          { n: 'Elevaciones Frontales con Mancuernas', sets: '3', reps: '12',    rs: 45, v: 'FeJbvGm_09k', tip: 'Alterna o simultáneo. Sube hasta paralelo. Trabaja el deltoides anterior.', er: [] },
        ]
      },
      {
        t: 'TRÍCEPS', s: false, e: [
          { n: 'Patadas de Tríceps (Kickback)',        sets: '3', reps: '12–15', rs: 45, v: 'vB5OHsJ3EMc', tip: 'Codo al nivel de la cadera. Extiende completamente el brazo. Contrae 1 seg en el tope.', er: [{l:'❌',t:'Codo que baja durante el movimiento'}] },
          { n: 'Extensiones en Polea Alta',            sets: '3', reps: '12–15', rs: 45, v: 'vB5OHsJ3EMc', tip: 'Codos pegados al cuerpo. Extiende completamente. Sube hasta 90° máximo.', er: [] },
          { n: 'Fondos entre Bancos al Fallo',         sets: '3', reps: 'al fallo', rs: 60, v: 'l4kQd9eWclE', tip: 'Pies en banco elevado. Cuerpo vertical. Baja hasta 90°. Al fallo sin compensar con el cuerpo.', er: [] },
        ]
      },
    ]
  },
  casa: {
    focus: 'Pecho · Hombros · Tríceps (variantes en casa)',
    blocks: [
      {
        t: 'PECHO', s: false, e: [
          { n: 'Flexiones Explosivas (clapping)',       sets: '4', reps: '8',      rs: 90, v: 'IODxDxX7oi4', tip: 'Explosión total al subir. Si no podés palmear: flexiones normales lo más rápido posible.', er: [] },
          { n: 'Flexiones Diamante',                   sets: '4', reps: '10–15',  rs: 75, v: 'IODxDxX7oi4', tip: 'Manos formando diamante bajo el pecho. Activa el pecho interno y el tríceps.', er: [] },
          { n: 'Flexiones Declinadas (pies arriba)',    sets: '3', reps: '12',     rs: 60, v: 'IODxDxX7oi4', tip: 'Pies en silla. El ángulo activa el pecho superior. Cuerpo recto durante todo.', er: [] },
        ]
      },
      {
        t: 'HOMBROS + TRÍCEPS', s: false, e: [
          { n: 'Pike Push-ups + Elevaciones con Botellas', sets: '4', reps: '8 + 20', rs: 75, v: 'sposDXWEB0A', tip: 'Superset: 8 pike push-ups directo a 20 elevaciones laterales. Sin descanso entre los dos.', er: [] },
          { n: 'Dips en Silla al Fallo',                   sets: '3', reps: 'al fallo', rs: 75, v: 'l4kQd9eWclE', tip: 'Cuerpo vertical para tríceps. Al fallo controlado. No bounces abajo.', er: [] },
        ]
      },
    ]
  }
},

// ════════════════════════════════════════════
// VIERNES — TRACCIÓN B
// Espalda · Bíceps (variantes con más volumen)
// ════════════════════════════════════════════
{
  day: 'VIE', label: 'ESPALDA · BÍCEPS (B)', rest: false, split: 'pullB',
  gym: {
    focus: 'Dorsal ancho · Espalda media · Bíceps volumen',
    blocks: [
      {
        t: 'ESPALDA', s: false, e: [
          { n: 'Dominadas al Fallo',              sets: '4', reps: 'al fallo', rs: 180, v: 'eGo4IYlbE5g', tip: 'Segunda sesión de dominadas de la semana. Si mejorás aunque sea 1 rep: progresión exitosa.', er: [] },
          { n: 'Jalón al Pecho (agarre neutro)',  sets: '4', reps: '10–12',    rs: 75,  v: 'CAwf7n6Luuc', tip: 'Agarre neutro (palmas enfrentadas). Reduce tensión en muñecas. Baja al pecho. Contrae 1 seg.', er: [{l:'❌',t:'Torso que va muy hacia atrás > 15°'}] },
          { n: 'Remo con Mancuerna',              sets: '4', reps: '10–12 × lado', rs: 75, v: 'roCP6wCXPqo', tip: 'Codo hacia el techo. Contrae la espalda en el tope. No rotas el torso.', er: [{l:'❌',t:'Rotar el torso al jalar'}] },
          { n: 'Pullover en Cable',               sets: '3', reps: '12–15',    rs: 60,  v: 'FK4jEXqJHZA', tip: 'Polea alta. Brazos casi rectos. Jala hacia abajo activando el dorsal. Tensión constante.', er: [] },
        ]
      },
      {
        t: 'BÍCEPS', s: false, e: [
          { n: 'Curl con Barra (de pie)',          sets: '3', reps: '8–10',  rs: 90,  v: 'av7-8igSXTs', tip: 'Codos fijos al cuerpo. Rango completo. Baja en 3 seg. No uses impulso del torso.', er: [{l:'❌',t:'Balancear el cuerpo para subir el peso'}] },
          { n: 'Curl Predicador con Mancuerna',   sets: '3', reps: '10–12', rs: 60,  v: 'BZFgeQfOCGE', tip: 'Codo en el pad elimina el balanceo. Baja completamente. Contrae 1 seg arriba.', er: [] },
          { n: 'Curl Martillo en Polea (cuerda)', sets: '3', reps: '12–15', rs: 45,  v: 'TwD-YGVP4Bk', tip: 'Polea baja con cuerda. Agarre neutro. La polea da tensión constante todo el rango.', er: [] },
        ]
      },
    ]
  },
  casa: {
    focus: 'Espalda · Bíceps (variantes con mochila)',
    blocks: [
      {
        t: 'ESPALDA', s: false, e: [
          { n: 'Dominadas con Pausa (o Inverted Row)', sets: '4', reps: 'máx con pausa 1 seg arriba', rs: 120, v: 'eGo4IYlbE5g', tip: 'La pausa de 1 seg en el tope multiplica el estímulo aunque hagas menos reps.', er: [] },
          { n: 'Remo con Mochila (bilateral, sobre silla)', sets: '4', reps: '12', rs: 75, v: 'roCP6wCXPqo', tip: 'Mochila pesada. Torso a 45°. Jala al abdomen. No uses inercia del torso.', er: [] },
        ]
      },
      {
        t: 'BÍCEPS', s: false, e: [
          { n: 'Curl con Mochila (supino) — 21s', sets: '3', reps: '21 (7+7+7)', rs: 90, v: 'av7-8igSXTs', tip: '7 reps mitad inferior + 7 reps mitad superior + 7 reps rango completo. Sin descanso entre los 21.', er: [] },
          { n: 'Curl Inverso con Botella',         sets: '3', reps: '15–20',       rs: 45, v: 'TwD-YGVP4Bk', tip: 'Agarre invertido (dorso arriba). Trabaja el braquiorradial. Codos fijos al cuerpo.', er: [] },
        ]
      },
    ]
  }
},

// ════════════════════════════════════════════
// SÁBADO — PIERNA B + CORE
// Peso muerto · Isquios · Glúteos · Core intenso
// ════════════════════════════════════════════
{
  day: 'SÁB', label: 'PIERNAS · CORE', rest: false, split: 'legB',
  gym: {
    focus: 'Isquiotibiales · Glúteos · Cuádriceps · Core',
    blocks: [
      {
        t: 'PIERNA', s: false, e: [
          { n: 'Peso Muerto Rumano (RDL)',         sets: '4', reps: '10–12', rs: 90,  v: 'op9kVnSso6Q', tip: 'Bisagra de cadera. Baja hasta sentir el jalón en los isquios. Rodillas ligeramente dobladas y fijas.', er: [{l:'❌',t:'Redondear la espalda baja'},{l:'❌',t:'Doblar demasiado las rodillas → se convierte en sentadilla'}] },
          { n: 'Curl de Isquiotibiales (máquina)', sets: '4', reps: '10–12', rs: 75,  v: 'Orxowest56U', tip: 'Baja en 3 seg. El músculo crece más bajando. Extensión completa. Sube explosivo.', er: [{l:'❌',t:'Levantar las caderas al jalar'}] },
          { n: 'Sentadilla Búlgara con Mancuernas', sets: '3', reps: '10 × pierna', rs: 90, v: 'QOVaHwm-Q6U', tip: 'Pie trasero en banco. Para énfasis en glúteo: inclina el torso ligeramente al frente.', er: [] },
          { n: 'Extensión de Cuádriceps (máquina)', sets: '3', reps: '15',   rs: 60,  v: '4ZDm5EbBAQY', tip: 'Pausa 2 seg en la extensión completa. Baja en 2 seg. Peso moderado, énfasis en la contracción.', er: [] },
        ]
      },
      {
        t: 'GLÚTEOS + PANTORRILLAS', s: false, e: [
          { n: 'Abducción de Cadera (máquina)',    sets: '3', reps: '20',    rs: 45, v: 'EsFQT0LBiIQ', tip: 'Glúteo medio. Abre contra la resistencia. Contrae en el tope. Peso moderado, volumen alto.', er: [] },
          { n: 'Pantorrillas Sentado (sóleo)',     sets: '4', reps: '15–20', rs: 30, v: 'gwLzBJYoWlQ', tip: 'Activa el sóleo (músculo profundo). Rango completo obligatorio. Pausa 2 seg arriba.', er: [] },
        ]
      },
      {
        t: 'CORE', s: false, e: [
          { n: 'Rueda Abdominal (Ab Wheel)',       sets: '4', reps: '8–12',  rs: 60, v: 'AhGCpbPf77U', tip: 'Desde rodillas. Extiende sin arquear la espalda baja. Vuelve contrayendo el abdomen.', er: [{l:'❌',t:'Espalda baja que se arquea al extender'}] },
          { n: 'Knee Raises Colgado en Barra',    sets: '3', reps: '12–15', rs: 60, v: 'hdng3gmd4e0', tip: 'Rota la pelvis al subir. Sin esa rotación solo trabajás los flexores de cadera.', er: [{l:'❌',t:'Balancearse — controlá la bajada'}] },
          { n: 'Plancha (RKC)',                   sets: '3', reps: '45 seg', rs: 45, v: 'ASdvN_XEl_c', tip: 'Aprieta simultáneamente: glúteos al máximo + abdomen + cuádriceps. Es más difícil que la plancha normal.', er: [] },
        ]
      },
    ]
  },
  casa: {
    focus: 'Cadena posterior · Core · Sin equipamiento',
    blocks: [
      {
        t: 'ISQUIOS + GLÚTEOS', s: false, e: [
          { n: 'Nordic Curl (pies bajo sofá)',       sets: '4', reps: '6–8',           rs: 120, v: '0Njz2FBOJIE', tip: 'El ejercicio más efectivo de isquios sin máquina. Baja LENTO (5-10 seg). Usa manos para subir.', er: [{l:'❌',t:'Bajar rápido sin control — el beneficio está en el frenado'}] },
          { n: 'Hip Thrust Elevado con Pausa',      sets: '4', reps: '15',            rs: 75,  v: 'SEdqd1n0cvg', tip: 'Hombros en el sofá. Pausa 3 seg arriba. Sin pausa es solo movimiento, con pausa es trabajo real.', er: [] },
          { n: 'Sentadilla Búlgara',                sets: '3', reps: '10 × pierna',   rs: 75,  v: 'QOVaHwm-Q6U', tip: 'Pie trasero en silla. Bajada en 3 seg. Si es fácil: usa mochila como contrapeso.', er: [] },
        ]
      },
      {
        t: 'CORE', s: false, e: [
          { n: 'Dead Bug',                          sets: '3', reps: '10 × lado',     rs: 60, v: 'g_BYB0R-4Ws', tip: 'Espalda PEGADA al suelo durante todo el movimiento. Si se arquea: reduce el rango.', er: [] },
          { n: 'Hollow Body Hold',                  sets: '3', reps: '30 seg',        rs: 45, v: 'ASdvN_XEl_c', tip: 'Espalda pegada al suelo. Brazos y piernas elevados. Cuanto más bajo las piernas, más difícil.', er: [] },
          { n: 'Russian Twists con Botella',        sets: '3', reps: '30',            rs: 45, v: 'wkD8rjkodUI', tip: 'Pies elevados del suelo. Torso a 45°. Toca el suelo alternando lados. Usa botella llena.', er: [] },
          { n: 'Plancha RKC',                       sets: '3', reps: '40 seg',        rs: 45, v: 'ASdvN_XEl_c', tip: 'Aprieta glúteos + abdomen + cuádriceps MÁXIMO. 40 seg de esto = 2 min de plancha normal.', er: [] },
        ]
      },
    ]
  }
},

// ════════════════════════════════════════════
// DOMINGO — Descanso activo
// ════════════════════════════════════════════
{
  day: 'DOM', label: 'DESCANSO ACTIVO', rest: true, gym: null, casa: null
}

]; // FIN PLAN



const MEAL_TYPES = ['desayuno', 'almuerzo', 'cena', 'snack'];
const CONFIDENCE_COLOR: Record<string, string> = {
  alta: '#3ddc84', media: '#c8ff00', baja: '#ff4d4d',
};

// ── Main App ──────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'home' | 'rutina' | 'nutricion' | 'progreso'>('home');

  useEffect(() => { fetchMe(); }, []);

  async function fetchMe() {
    try {
      const r = await fetch('/api/auth/me');
      if (r.ok) { const d = await r.json(); setUser(d.user); setProfile(d.profile); }
    } finally { setLoading(false); }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null); setProfile(null);
  }

  if (loading) return <Spinner />;
  if (!user) return <AuthScreen onAuth={(u, p) => { setUser(u); setProfile(p); }} />;

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#f2f0ea', fontFamily: 'DM Sans, sans-serif', paddingBottom: 80 }}>
      {tab === 'home' && <HomeTab user={user} profile={profile} onLogout={logout} />}
      {tab === 'rutina' && <RutinaTab />}
      {tab === 'nutricion' && <NutricionTab profile={profile} onProfileSaved={setProfile} />}
      {tab === 'progreso' && <ProgresoTab />}
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}

// ── Bottom Nav ────────────────────────────────────────────
function BottomNav({ tab, setTab }: { tab: string; setTab: (t: any) => void }) {
  const items = [
    { id: 'home', icon: '🏠', label: 'Inicio' },
    { id: 'rutina', icon: '💪', label: 'Rutina' },
    { id: 'nutricion', icon: '🥗', label: 'Nutrición' },
    { id: 'progreso', icon: '📊', label: 'Progreso' },
  ];
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10,10,10,0.95)', borderTop: '1px solid #2a2a2a', display: 'flex', backdropFilter: 'blur(12px)', zIndex: 50 }}>
      {items.map(i => (
        <button key={i.id} onClick={() => setTab(i.id)} style={{ flex: 1, padding: '12px 8px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: tab === i.id ? '#c8ff00' : '#666', transition: 'color .15s' }}>
          <span style={{ fontSize: 20 }}>{i.icon}</span>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>{i.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Auth Screen ───────────────────────────────────────────
function AuthScreen({ onAuth }: { onAuth: (u: User, p: Profile) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true); setError('');
    const url = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login' ? { email, password } : { email, name, password };
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) { setError(d.error || 'Error'); return; }
    const me = await fetch('/api/auth/me');
    const meData = await me.json();
    onAuth(d.user, meData.profile || null);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 52, letterSpacing: 4, color: '#c8ff00', marginBottom: 4 }}>BURN GT</div>
      <div style={{ color: '#666', fontSize: 12, marginBottom: 40, letterSpacing: 2, textTransform: 'uppercase' }}>Tu sistema de transformación</div>
      <div style={{ width: '100%', maxWidth: 360, background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, padding: 24 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {(['login', 'register'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '10px', background: mode === m ? '#c8ff00' : '#1a1a1a', color: mode === m ? '#000' : '#666', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer' }}>
              {m === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>
        {mode === 'register' && <Input label="Nombre" value={name} onChange={setName} placeholder="Tu nombre" />}
        <Input label="Email" value={email} onChange={setEmail} placeholder="tu@email.com" type="email" />
        <Input label="Contraseña" value={password} onChange={setPassword} placeholder="••••••••" type="password" />
        {error && <div style={{ color: '#ff4d4d', fontSize: 12, marginBottom: 12 }}>{error}</div>}
        <button onClick={submit} disabled={busy} style={{ width: '100%', background: '#c8ff00', color: '#000', border: 'none', borderRadius: 10, padding: '14px', fontFamily: '"Bebas Neue", sans-serif', fontSize: 18, letterSpacing: 2, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1 }}>
          {busy ? '...' : mode === 'login' ? 'ENTRAR' : 'CREAR CUENTA'}
        </button>
      </div>
    </div>
  );
}

// ── Home Tab ──────────────────────────────────────────────
function HomeTab({ user, profile, onLogout }: { user: User; profile: Profile; onLogout: () => void }) {
  const todayPlan = PLAN[DAY_IDX];

  return (
    <div>
      <div style={{ padding: '20px 18px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>Bienvenido de vuelta</div>
          <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 36, letterSpacing: 1, lineHeight: 1, color: '#c8ff00' }}>{user.name.toUpperCase()}</div>
        </div>
        <button onClick={onLogout} style={{ background: 'none', border: '1px solid #2a2a2a', color: '#555', borderRadius: 8, padding: '6px 12px', fontSize: 11, cursor: 'pointer' }}>Salir</button>
      </div>

      {/* Today card */}
      <div style={{ margin: '20px 18px 0', background: '#111', border: '1px solid #2a2a2a', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid #2a2a2a', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 4 }}>HOY — {todayPlan.day}</div>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 22, letterSpacing: 1 }}>{todayPlan.label}</div>
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', padding: '4px 10px', background: 'rgba(200,255,0,0.1)', color: '#c8ff00', borderRadius: 4 }}>
            {todayPlan.split === 'rest' ? '😴 DESCANSO' : '🏋️ PPL+ARNOLD'}
          </div>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
            {todayPlan.split === 'rest' ? 'Día de descanso activo — movilidad y recuperación.' : 'Recordá registrar tus series y elegir gym o casa cuando abras la sesión.'}
          </div>
        </div>
      </div>

      {/* Macro targets */}
      {profile ? (
        <div style={{ margin: '16px 18px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>OBJETIVOS DIARIOS</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {[
              { label: 'Calorías', val: profile.goal_kcal, color: '#c8ff00', unit: 'kcal' },
              { label: 'Proteína', val: profile.goal_prot, color: '#4daaff', unit: 'g' },
              { label: 'Carbos', val: profile.goal_carb, color: '#ff4d4d', unit: 'g' },
            ].map(m => (
              <div key={m.label} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
                <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 26, color: m.color, lineHeight: 1 }}>{m.val}</div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#555', marginTop: 3 }}>{m.label} {m.unit}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ margin: '16px 18px 0', background: 'rgba(200,255,0,0.04)', border: '1px solid rgba(200,255,0,0.15)', borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 12, color: '#c8ff00', marginBottom: 4, fontWeight: 700 }}>⚙️ Configura tu perfil nutricional</div>
          <div style={{ fontSize: 12, color: '#666' }}>Ve a la pestaña Nutrición para calcular tu TDEE y macros.</div>
        </div>
      )}

      {/* Principles */}
      <div style={{ margin: '20px 18px 0', paddingBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>PRINCIPIOS</div>
        {[
          { icon: '📏', title: 'La recomposición es lenta', desc: 'No se ve en 2 semanas. Se nota en meses. Constancia sobre perfección.' },
          { icon: '⚡', title: 'Series cerca del fallo', desc: 'Ejercicios compuestos, progresión de cargas, 0–2 RIR.' },
          { icon: '😴', title: 'El músculo crece descansando', desc: 'Mínimo 7 horas. Dormir a la misma hora es beneficioso.' },
        ].map(p => (
          <div key={p.title} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 12, padding: '12px 14px', display: 'flex', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 20 }}>{p.icon}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{p.title}</div>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.5 }}>{p.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ── Rutina Tab (FULL PLAN RENDERER) ──────────────────────
function RutinaTab() {
  const [selDay, setSelDay] = useState(DAY_IDX);
  const [sessionMode, setSessionMode] = useState<'gym' | 'casa' | null>(null);
  const [showModeModal, setShowModeModal] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restRunning, setRestRunning] = useState(false);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const dayPlan = PLAN[selDay] as any;

  useEffect(() => {
    setSessionMode(null);
    setSession(null);
    setExpanded({});
    setDone({});
    if (dayPlan && !dayPlan.rest) setShowModeModal(true);
  }, [selDay]);

  useEffect(() => {
    if (restTimer === null) return;
    if (restTimer <= 0) {
      setRestRunning(false);
      if (restRef.current) clearInterval(restRef.current);
      setRestTimer(null);
      if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
      return;
    }
    if (restRunning) {
      restRef.current = setInterval(() => setRestTimer(t => (t ?? 1) - 1), 1000);
    }
    return () => { if (restRef.current) clearInterval(restRef.current); };
  }, [restRunning]);

  async function selectMode(mode: 'gym' | 'casa') {
    setSessionMode(mode);
    setShowModeModal(false);
    const r = await fetch('/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day_key: dayPlan.day, split_type: dayPlan.split || 'rest', mode, session_date: TODAY }),
    });
    if (r.ok) { const d = await r.json(); setSession(d.session); }
  }

  async function completeSession() {
    if (!session) return;
    await fetch(`/api/workouts/${session.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: true }),
    });
    setSession(s => s ? { ...s, completed: true } : null);
  }

  function startRest(secs: number) {
    if (restRef.current) clearInterval(restRef.current);
    setRestTimer(secs);
    setRestRunning(true);
    restRef.current = setInterval(() => setRestTimer(t => {
      if ((t ?? 1) <= 1) {
        clearInterval(restRef.current!);
        setRestRunning(false);
        if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
        return null;
      }
      return (t ?? 1) - 1;
    }), 1000);
  }

  function toggleDone(key: string, restSecs: number) {
    const newVal = !done[key];
    setDone(d => ({ ...d, [key]: newVal }));
    if (newVal && restSecs > 0) startRest(restSecs);
  }

  const plan = sessionMode ? (dayPlan[sessionMode] as any) : null;

  // Count progress
  const allExKeys = plan?.blocks?.flatMap((b: any, bi: number) =>
    b.e.map((_: any, ei: number) => `${selDay}_${sessionMode}_${bi}_${ei}`)
  ) ?? [];
  const doneCount = allExKeys.filter((k: string) => done[k]).length;
  const pct = allExKeys.length > 0 ? Math.round((doneCount / allExKeys.length) * 100) : 0;

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Day strip */}
      <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #2a2a2a', position: 'sticky', top: 0, background: '#0a0a0a', zIndex: 40 }}>
        {PLAN.map((d: any, i: number) => (
          <button key={i} onClick={() => setSelDay(i)} style={{ flexShrink: 0, padding: '12px 14px 10px', background: 'none', border: 'none', borderBottom: `3px solid ${i === selDay ? '#c8ff00' : 'transparent'}`, cursor: 'pointer', textAlign: 'center', minWidth: 52 }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 17, letterSpacing: 1, color: i === selDay ? '#c8ff00' : '#555' }}>{d.day}</div>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: i === selDay ? '#888' : '#333', marginTop: 2 }}>
              {d.rest ? 'DESC' : (d.split || '').replace(/[ABC123]/g, '').toUpperCase().slice(0, 5)}
            </div>
          </button>
        ))}
      </div>

      {/* Gym/Casa modal */}
      {showModeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 10 }}>SESIÓN DE HOY — {dayPlan?.day}</div>
          <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 32, letterSpacing: 1, marginBottom: 6, textAlign: 'center', lineHeight: 1.1 }}>{dayPlan?.label}</div>
          {dayPlan?.coachNote && (
            <div style={{ fontSize: 12, color: '#555', marginBottom: 24, textAlign: 'center', maxWidth: 300, lineHeight: 1.6, fontStyle: 'italic' }}>"{dayPlan.coachNote.slice(0, 120)}..."</div>
          )}
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>¿Vas al gym hoy?</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 320 }}>
            <button onClick={() => selectMode('gym')} style={{ background: '#c8ff00', color: '#000', border: 'none', borderRadius: 14, padding: '20px', fontFamily: '"Bebas Neue", sans-serif', fontSize: 20, letterSpacing: 3, cursor: 'pointer' }}>
              🏛️ SÍ, VOY AL GYM
            </button>
            <button onClick={() => selectMode('casa')} style={{ background: '#1a1a1a', color: '#ff4d4d', border: '1.5px solid #ff4d4d', borderRadius: 14, padding: '20px', fontFamily: '"Bebas Neue", sans-serif', fontSize: 20, letterSpacing: 3, cursor: 'pointer' }}>
              🏠 NO, ME QUEDO EN CASA
            </button>
            <button onClick={() => { setShowModeModal(false); }} style={{ background: 'none', border: 'none', color: '#444', fontSize: 12, cursor: 'pointer', marginTop: 4 }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Rest overlay */}
      {restTimer !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 10 }}>RECUPERANDO</div>
          <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 120, lineHeight: 1, color: restTimer <= 10 ? '#ff4d4d' : '#c8ff00' }}>{restTimer}</div>
          <div style={{ fontSize: 13, color: '#555', marginTop: 8 }}>segundos de descanso</div>
          <button onClick={() => { if (restRef.current) clearInterval(restRef.current); setRestTimer(null); setRestRunning(false); }} style={{ marginTop: 28, background: 'none', border: '1px solid #333', color: '#555', borderRadius: 9, padding: '10px 28px', fontSize: 13, cursor: 'pointer' }}>SALTAR →</button>
        </div>
      )}

      {/* Rest day */}
      {dayPlan?.rest && (
        <div style={{ padding: '32px 18px', textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>🧘</div>
          <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 36, letterSpacing: 2, color: '#3ddc84', marginBottom: 8 }}>DESCANSO ACTIVO</div>
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.7, marginBottom: 24, maxWidth: 280, margin: '0 auto 24px' }}>El músculo crece y la grasa se metaboliza durante el descanso. No lo saltés.</div>
          {['🔄 Rotaciones articulares · 5 min', '🦵 Estiramiento de isquios y cuádriceps · 45 seg × lado', '🌊 Cobra + Child\'s Pose · 60 seg c/u', '🚶 Caminata suave 20–30 min', '💧 Hidratación alta · 3L de agua mínimo'].map(item => (
            <div key={item} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 14px', textAlign: 'left', marginBottom: 8, fontSize: 13 }}>{item}</div>
          ))}
        </div>
      )}

      {/* Session with mode selected */}
      {sessionMode && plan && (
        <div style={{ padding: '0 0 20px' }}>
          {/* Header */}
          <div style={{ padding: '16px 18px 10px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', padding: '5px 12px', borderRadius: 4, marginBottom: 8, background: sessionMode === 'gym' ? 'rgba(200,255,0,0.1)' : 'rgba(255,77,77,0.08)', color: sessionMode === 'gym' ? '#c8ff00' : '#ff4d4d' }}>
              {sessionMode === 'gym' ? '🏛️ GYM' : '🏠 CASA'}
            </div>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 26, letterSpacing: 1, lineHeight: 1 }}>{dayPlan.label}</div>
            <div style={{ fontSize: 11, color: '#666', marginTop: 3 }}>{plan.focus}</div>

            {/* Warmup */}
            {plan.warmup && (
              <div style={{ marginTop: 10, background: 'rgba(61,220,132,0.06)', border: '1px solid rgba(61,220,132,0.2)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#3ddc84', marginBottom: 4 }}>🔥 CALENTAMIENTO</div>
                <div style={{ fontSize: 12, color: '#888' }}>{plan.warmup}</div>
              </div>
            )}

            {/* Coach note */}
            {dayPlan.coachNote && (
              <div style={{ marginTop: 8, background: 'rgba(200,255,0,0.04)', border: '1px solid rgba(200,255,0,0.12)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#c8ff00', marginBottom: 4 }}>💡 NOTA DEL COACH</div>
                <div style={{ fontSize: 11, color: '#777', lineHeight: 1.6, fontStyle: 'italic' }}>{dayPlan.coachNote}</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
              <button onClick={() => setShowModeModal(true)} style={{ background: 'none', border: '1px solid #2a2a2a', color: '#555', borderRadius: 7, padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}>Cambiar modo</button>
              {session?.completed && <span style={{ fontSize: 11, color: '#3ddc84', fontWeight: 700 }}>✓ SESIÓN COMPLETADA</span>}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ padding: '0 18px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#555' }}>Progreso</span>
              <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 20, color: '#c8ff00' }}>{pct}%</span>
            </div>
            <div style={{ background: '#1a1a1a', borderRadius: 3, height: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: '#c8ff00', borderRadius: 3, width: `${pct}%`, transition: 'width .4s' }} />
            </div>
          </div>

          {/* Blocks */}
          {plan.blocks?.map((block: any, bi: number) => (
            <div key={bi} style={{ padding: '0 18px' }}>
              {/* Block title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '16px 0 10px', fontSize: 9, fontWeight: 700, letterSpacing: 2.5, textTransform: 'uppercase', color: block.s ? '#c8ff00' : '#555' }}>
                {block.s && <span style={{ background: 'rgba(200,255,0,0.1)', color: '#c8ff00', padding: '2px 7px', borderRadius: 4, fontSize: 8 }}>SUPERSET</span>}
                <span>{block.t}</span>
                <div style={{ flex: 1, height: 1, background: '#2a2a2a' }} />
              </div>

              {/* Superset bracket */}
              <div style={{ position: 'relative', paddingLeft: block.s ? 12 : 0 }}>
                {block.s && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: '#c8ff00', opacity: 0.25, borderRadius: 2 }} />}

                {block.e.map((ex: any, ei: number) => {
                  const key = `${selDay}_${sessionMode}_${bi}_${ei}`;
                  const isOpen = expanded[key];
                  const isDone = done[key];
                  return (
                    <div key={ei} style={{ background: '#111', border: `1px solid ${isDone ? '#333' : '#2a2a2a'}`, borderRadius: 13, marginBottom: 8, overflow: 'hidden', opacity: isDone ? 0.5 : 1, transition: 'all .2s' }}>
                      {/* Exercise main row */}
                      <div onClick={() => setExpanded(e => ({ ...e, [key]: !e[key] }))} style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Color bar */}
                        <div style={{ width: 3, alignSelf: 'stretch', borderRadius: 3, flexShrink: 0, background: sessionMode === 'gym' ? '#c8ff00' : '#ff4d4d' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{ex.n}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: .3, textTransform: 'uppercase', padding: '3px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: '#666' }}>{ex.sets} series</span>
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: .3, textTransform: 'uppercase', padding: '3px 7px', borderRadius: 4, background: sessionMode === 'gym' ? 'rgba(200,255,0,0.1)' : 'rgba(255,77,77,0.1)', color: sessionMode === 'gym' ? '#c8ff00' : '#ff4d4d' }}>{ex.reps} reps</span>
                            {ex.rest > 0 && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: .3, textTransform: 'uppercase', padding: '3px 7px', borderRadius: 4, background: 'rgba(255,255,255,0.04)', color: '#555' }}>⏱ {ex.rest}s</span>}
                            {ex.tempo && <span style={{ fontSize: 10, padding: '3px 7px', borderRadius: 4, background: 'rgba(77,170,255,0.08)', color: '#4daaff' }}>TEMPO {ex.tempo}</span>}
                          </div>
                          {ex.muscle && <div style={{ fontSize: 10, color: '#444', marginTop: 4, fontStyle: 'italic' }}>{ex.muscle}</div>}
                        </div>
                        {/* Check button */}
                        <div onClick={e => { e.stopPropagation(); toggleDone(key, ex.rest || 60); }}
                          style={{ width: 32, height: 32, border: `2px solid ${isDone ? '#3ddc84' : '#333'}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, background: isDone ? '#3ddc84' : 'transparent', color: isDone ? '#000' : 'transparent', fontSize: 14, fontWeight: 700, transition: 'all .2s' }}>
                          ✓
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {isOpen && (
                        <div style={{ padding: '12px 14px', borderTop: '1px solid #1a1a1a' }}>
                          {/* Coach tip */}
                          <div style={{ background: 'rgba(200,255,0,0.04)', border: '1px solid rgba(200,255,0,0.12)', borderRadius: 9, padding: '10px 12px', marginBottom: 10 }}>
                            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#c8ff00', marginBottom: 5 }}>💡 TÉCNICA</div>
                            <div style={{ fontSize: 12, color: '#888', lineHeight: 1.7 }}>{ex.tip}</div>
                          </div>

                          {/* Progression note */}
                          {ex.progression && (
                            <div style={{ background: 'rgba(77,170,255,0.05)', border: '1px solid rgba(77,170,255,0.15)', borderRadius: 9, padding: '8px 12px', marginBottom: 10 }}>
                              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#4daaff', marginBottom: 4 }}>📈 PROGRESIÓN</div>
                              <div style={{ fontSize: 11, color: '#666', lineHeight: 1.6 }}>{ex.progression}</div>
                            </div>
                          )}

                          {/* Errors */}
                          {ex.er?.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginBottom: 10 }}>
                              {ex.er.map((err: any, ei2: number) => (
                                <div key={ei2} style={{ background: 'rgba(255,77,77,0.07)', borderRadius: 8, padding: '7px 9px' }}>
                                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#ff4d4d', marginBottom: 2 }}>{err.l}</div>
                                  <div style={{ fontSize: 10, color: '#f2f0ea', lineHeight: 1.4 }}>{err.t}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* YouTube button */}
                          {ex.v && (
                            <a href={`https://www.youtube.com/watch?v=${ex.v}`} target="_blank" rel="noopener noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.04)', border: '1px solid #2a2a2a', color: '#cc4444', borderRadius: 7, padding: '6px 12px', fontSize: 11, fontWeight: 700, textDecoration: 'none' }}>
                              <span>▶</span> Ver técnica en YouTube
                            </a>
                          )}

                          {/* Rest timer button */}
                          {ex.rest > 0 && (
                            <button onClick={() => startRest(ex.rest)} style={{ marginLeft: 8, background: 'rgba(200,255,0,0.08)', border: '1px solid rgba(200,255,0,0.2)', color: '#c8ff00', borderRadius: 7, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                              ⏱ Descanso {ex.rest}s
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Complete button */}
          <div style={{ padding: '16px 18px 0' }}>
            <button onClick={completeSession} disabled={!!session?.completed}
              style={{ width: '100%', background: session?.completed ? '#3ddc84' : '#c8ff00', color: '#000', border: 'none', borderRadius: 12, padding: '16px', fontFamily: '"Bebas Neue", sans-serif', fontSize: 18, letterSpacing: 3, cursor: session?.completed ? 'default' : 'pointer', transition: 'all .2s' }}>
              {session?.completed ? '✓ SESIÓN COMPLETADA' : 'MARCAR SESIÓN COMPLETADA'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Nutricion Tab ─────────────────────────────────────────
function NutricionTab({ profile, onProfileSaved }: { profile: Profile; onProfileSaved: (p: any) => void }) {
  const [subTab, setSubTab] = useState<'log' | 'tdee'>('log');
  const [foods, setFoods] = useState<FoodLog[]>([]);
  const [totals, setTotals] = useState({ kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
  const [loading, setLoading] = useState(false);

  // AI Estimator state
  const [query, setQuery] = useState('');
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<FoodEstimate | null>(null);
  const [mealType, setMealType] = useState('desayuno');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // TDEE form
  const [sex, setSex] = useState<'m' | 'f'>('m');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState<'sed' | 'med' | 'hi'>('med');
  const [goal, setGoal] = useState<'def' | 'mant' | 'vol' | 'agr'>('def');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => { fetchFoods(); }, []);

  async function fetchFoods() {
    const r = await fetch(`/api/nutrition?date=${TODAY}`);
    if (r.ok) { const d = await r.json(); setFoods(d.foods); setTotals(d.totals); }
  }

  async function estimateFood() {
    if (!query.trim()) return;
    setEstimating(true); setEstimate(null);
    const r = await fetch('/api/nutrition/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: query }),
    });
    const d = await r.json();
    setEstimating(false);
    if (r.ok) setEstimate(d.estimate);
    else showToast('Error: ' + d.error);
  }

  async function saveEstimate() {
    if (!estimate) return;
    setSaving(true);
    const r = await fetch('/api/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        food_name: estimate.food_name,
        kcal: estimate.kcal,
        protein_g: estimate.protein_g,
        carbs_g: estimate.carbs_g,
        fat_g: estimate.fat_g,
        meal_type: mealType,
      }),
    });
    setSaving(false);
    if (r.ok) {
      setQuery(''); setEstimate(null);
      showToast(`✅ ${estimate.food_name} guardado`);
      fetchFoods();
    }
  }

  async function deleteFood(id: string) {
    await fetch(`/api/nutrition?id=${id}`, { method: 'DELETE' });
    fetchFoods();
  }

  async function saveProfile() {
    setSavingProfile(true);
    const r = await fetch('/api/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sex, age: +age, weight_kg: +weight, height_cm: +height, activity, goal }),
    });
    if (r.ok) { const d = await r.json(); onProfileSaved(d.profile); showToast('✅ Perfil guardado'); }
    setSavingProfile(false);
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  return (
    <div>
      <div style={{ padding: '20px 18px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>Seguimiento</div>
        <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 42, lineHeight: 0.9, letterSpacing: -1 }}>NUTRICIÓN<br /><span style={{ color: '#c8ff00' }}>Y MACROS</span></div>
      </div>

      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '16px 18px 0' }}>
        {([['log', '🥗 Registro'], ['tdee', '⚙️ Mi TDEE']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setSubTab(id)} style={{ flex: 1, padding: '10px', background: subTab === id ? '#c8ff00' : '#111', color: subTab === id ? '#000' : '#555', border: `1px solid ${subTab === id ? '#c8ff00' : '#2a2a2a'}`, borderRadius: 9, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{label}</button>
        ))}
      </div>

      {subTab === 'log' && (
        <div style={{ padding: '16px 18px 0' }}>
          {/* Daily progress */}
          {profile && (
            <div style={{ marginBottom: 16 }}>
              {[
                { label: 'Calorías', curr: totals.kcal, goal: profile.goal_kcal, color: '#c8ff00', unit: 'kcal' },
                { label: 'Proteína', curr: Math.round(totals.protein_g), goal: profile.goal_prot, color: '#4daaff', unit: 'g' },
              ].map(m => (
                <div key={m.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, fontWeight: 700 }}>
                    <span style={{ color: '#888' }}>{m.label}</span>
                    <span style={{ color: m.color }}>{m.curr} / {m.goal} {m.unit}</span>
                  </div>
                  <div style={{ background: '#1a1a1a', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: m.color, borderRadius: 4, width: `${Math.min(100, Math.round(m.curr / m.goal * 100))}%`, transition: 'width .4s' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Estimator */}
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#c8ff00', marginBottom: 10 }}>🤖 ESTIMAR CON IA</div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>Describí tu comida en lenguaje natural y la IA calcula los macros.</div>
            <textarea
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={'Ej: "pan con huevo frito y salchicha"\n"2 tortillas con frijoles y queso"\n"arroz con pollo, porción grande"'}
              style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 12px', color: '#f2f0ea', fontSize: 13, resize: 'none', outline: 'none', height: 80, fontFamily: 'inherit' }}
              onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) estimateFood(); }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <select value={mealType} onChange={e => setMealType(e.target.value)} style={{ flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '8px 10px', color: '#f2f0ea', fontSize: 12 }}>
                {MEAL_TYPES.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
              </select>
              <button onClick={estimateFood} disabled={estimating || !query.trim()} style={{ padding: '8px 16px', background: estimating ? '#333' : '#c8ff00', color: estimating ? '#666' : '#000', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {estimating ? '⏳ Estimando...' : '✨ Estimar'}
              </button>
            </div>

            {/* Estimate result */}
            {estimate && (
              <div style={{ marginTop: 14, background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{estimate.food_name}</div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>{estimate.serving_description}</div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '3px 8px', borderRadius: 4, background: `${CONFIDENCE_COLOR[estimate.confidence]}22`, color: CONFIDENCE_COLOR[estimate.confidence] }}>
                    {estimate.confidence.toUpperCase()}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 10 }}>
                  {[
                    { l: 'Kcal', v: estimate.kcal, c: '#c8ff00' },
                    { l: 'Prot', v: `${estimate.protein_g}g`, c: '#4daaff' },
                    { l: 'Carbs', v: `${estimate.carbs_g}g`, c: '#ff4d4d' },
                    { l: 'Grasas', v: `${estimate.fat_g}g`, c: '#f4a261' },
                  ].map(m => (
                    <div key={m.l} style={{ textAlign: 'center', background: '#1a1a1a', borderRadius: 8, padding: '8px 4px' }}>
                      <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 20, color: m.c }}>{m.v}</div>
                      <div style={{ fontSize: 9, color: '#555', fontWeight: 700, letterSpacing: 1 }}>{m.l}</div>
                    </div>
                  ))}
                </div>
                {/* Breakdown */}
                {estimate.items?.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>DESGLOSE</div>
                    {estimate.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '4px 0', borderBottom: '1px solid #1a1a1a', color: '#888' }}>
                        <span>{item.name}</span>
                        <span style={{ color: '#c8ff00' }}>{item.kcal} kcal · {item.protein_g}g P</span>
                      </div>
                    ))}
                  </div>
                )}
                {estimate.notes && <div style={{ fontSize: 11, color: '#555', marginBottom: 10, fontStyle: 'italic' }}>💡 {estimate.notes}</div>}
                <button onClick={saveEstimate} disabled={saving} style={{ width: '100%', background: '#3ddc84', color: '#000', border: 'none', borderRadius: 9, padding: '11px', fontFamily: '"Bebas Neue", sans-serif', fontSize: 15, letterSpacing: 2, cursor: 'pointer' }}>
                  {saving ? '...' : '+ GUARDAR EN MI REGISTRO'}
                </button>
              </div>
            )}
          </div>

          {/* Food log */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>REGISTRO DE HOY</div>
            {foods.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#555', fontSize: 12, padding: '20px 0' }}>Sin registros aún. Describí tu primera comida arriba ↑</div>
            ) : (
              foods.map(f => (
                <div key={f.id} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 12px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{f.food_name}</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                      {f.kcal} kcal · {f.protein_g}g P · {f.meal_type}
                    </div>
                  </div>
                  <button onClick={() => deleteFood(f.id)} style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', fontSize: 16, padding: 4 }}>✕</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {subTab === 'tdee' && (
        <div style={{ padding: '16px 18px 0' }}>
          {profile && (
            <div style={{ background: 'rgba(200,255,0,0.06)', border: '1px solid rgba(200,255,0,0.2)', borderRadius: 12, padding: 14, marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#c8ff00', marginBottom: 4 }}>TU TDEE ACTUAL</div>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 52, color: '#c8ff00', lineHeight: 1 }}>{profile.tdee}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>kcal de mantenimiento → objetivo: <strong style={{ color: '#f2f0ea' }}>{profile.goal_kcal} kcal</strong></div>
            </div>
          )}
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 16 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {(['m', 'f'] as const).map(s => (
                <button key={s} onClick={() => setSex(s)} style={{ flex: 1, padding: '9px', background: sex === s ? '#c8ff00' : '#1a1a1a', color: sex === s ? '#000' : '#666', border: `1.5px solid ${sex === s ? '#c8ff00' : '#2a2a2a'}`, borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                  {s === 'm' ? '♂ Hombre' : '♀ Mujer'}
                </button>
              ))}
            </div>
            <Input label="Edad (años)" value={age} onChange={setAge} placeholder="25" type="number" />
            <Input label="Peso (kg)" value={weight} onChange={setWeight} placeholder="75" type="number" />
            <Input label="Altura (cm)" value={height} onChange={setHeight} placeholder="175" type="number" />
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Nivel de actividad</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {([['sed', '😴 Sedentario ×1.2'], ['med', '⚖️ Activo ×1.55'], ['hi', '🔥 Muy activo ×1.75']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setActivity(v)} style={{ flex: 1, minWidth: 0, padding: '8px 6px', background: activity === v ? '#c8ff00' : '#1a1a1a', color: activity === v ? '#000' : '#666', border: `1.5px solid ${activity === v ? '#c8ff00' : '#2a2a2a'}`, borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'center' }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', marginBottom: 6 }}>Objetivo</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {([['def', '🔥 Quemar grasa'], ['mant', '⚖️ Recomposición'], ['vol', '📈 Ganar músculo'], ['agr', '⚡ Déficit agresivo']] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setGoal(v)} style={{ padding: '10px', background: goal === v ? (v === 'def' || v === 'agr' ? 'rgba(255,77,77,0.1)' : 'rgba(200,255,0,0.08)') : '#1a1a1a', color: goal === v ? (v === 'def' || v === 'agr' ? '#ff4d4d' : '#c8ff00') : '#666', border: `1.5px solid ${goal === v ? (v === 'def' || v === 'agr' ? '#ff4d4d' : '#c8ff00') : '#2a2a2a'}`, borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>{l}</button>
                ))}
              </div>
            </div>
            <button onClick={saveProfile} disabled={savingProfile || !age || !weight || !height} style={{ width: '100%', background: savingProfile ? '#333' : '#c8ff00', color: savingProfile ? '#666' : '#000', border: 'none', borderRadius: 10, padding: '13px', fontFamily: '"Bebas Neue", sans-serif', fontSize: 16, letterSpacing: 2, cursor: 'pointer' }}>
              {savingProfile ? 'GUARDANDO...' : 'CALCULAR Y GUARDAR'}
            </button>
          </div>
          <div style={{ margin: '12px 0', background: 'rgba(200,255,0,0.04)', border: '1px solid rgba(200,255,0,0.12)', borderRadius: 12, padding: 13 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#c8ff00', marginBottom: 6 }}>FÓRMULA MIFFLIN–ST JEOR</div>
            <div style={{ fontSize: 11, color: '#555', lineHeight: 1.7 }}>
              <strong style={{ color: '#888' }}>Hombres:</strong> (10 × kg) + (6.25 × cm) – (5 × edad) + 5<br />
              <strong style={{ color: '#888' }}>Mujeres:</strong> (10 × kg) + (6.25 × cm) – (5 × edad) – 161<br />
              × Factor de actividad = TDEE
            </div>
          </div>
          <div style={{ background: 'rgba(77,170,255,0.05)', border: '1px solid rgba(77,170,255,0.15)', borderRadius: 12, padding: 13, marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#4daaff', marginBottom: 5 }}>¿CÓMO AJUSTAR?</div>
            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.6 }}>Si después de <strong style={{ color: '#f2f0ea' }}>2 semanas</strong> tu peso no cambia: suma 200 kcal si querés subir, resta 200 si querés bajar.</div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#111', border: '1px solid #2a2a2a', color: '#c8ff00', padding: '10px 18px', borderRadius: 9, fontWeight: 700, fontSize: 12, zIndex: 500, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Progreso Tab ──────────────────────────────────────────
function ProgresoTab() {
  const [data, setData] = useState<any>(null);
  const [weights, setWeights] = useState<WeightLog[]>([]);
  const [newWeight, setNewWeight] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [prog, w] = await Promise.all([
      fetch('/api/progress').then(r => r.json()),
      fetch('/api/weight?days=60').then(r => r.json()),
    ]);
    setData(prog);
    setWeights(w.logs || []);
    setLoading(false);
  }

  async function logWeight() {
    const v = parseFloat(newWeight);
    if (isNaN(v) || v < 30 || v > 300) return;
    const r = await fetch('/api/weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weight_kg: v }),
    });
    if (r.ok) {
      setNewWeight('');
      showToast(`✅ ${v} kg registrado`);
      fetchAll();
    }
  }

  async function deleteWeight(id: string) {
    await fetch(`/api/weight?id=${id}`, { method: 'DELETE' });
    fetchAll();
  }

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000); }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#555' }}>Cargando...</div>;

  const ws = data?.weightStats;
  const ts = data?.trainingStats;
  const ns = data?.nutritionStats;

  return (
    <div>
      <div style={{ padding: '20px 18px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', color: '#555', marginBottom: 6 }}>Tu transformación</div>
        <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 42, lineHeight: 0.9, letterSpacing: -1 }}>PROGRESO<br /><span style={{ color: '#c8ff00' }}>Y STATS</span></div>
      </div>

      {/* Key stats */}
      <div style={{ margin: '20px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[
          { label: 'Racha actual', val: data?.streak ?? 0, unit: 'días 🔥', color: '#c8ff00' },
          { label: 'Sesiones completadas', val: ts?.total_completed ?? 0, unit: 'total', color: '#4daaff' },
          { label: 'Peso actual', val: ws?.current ? `${ws.current} kg` : '—', unit: 'corporal', color: '#3ddc84' },
          { label: 'Cambio de peso', val: ws?.change ? `${ws.change > 0 ? '+' : ''}${ws.change} kg` : '—', unit: 'total', color: ws?.change < 0 ? '#3ddc84' : '#ff4d4d' },
        ].map(s => (
          <div key={s.label} style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 16 }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 32, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>{s.unit}</div>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: '#333', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Weight logger */}
      <div style={{ margin: '16px 18px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>REGISTRAR PESO HOY</div>
        <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 14 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="75.5 kg" type="number" step="0.1"
              style={{ flex: 1, background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 9, padding: '10px 12px', color: '#f2f0ea', fontSize: 15, outline: 'none' }}
              onKeyDown={e => e.key === 'Enter' && logWeight()} />
            <button onClick={logWeight} style={{ background: '#c8ff00', color: '#000', border: 'none', borderRadius: 9, padding: '10px 18px', fontFamily: '"Bebas Neue", sans-serif', fontSize: 14, letterSpacing: 1.5, cursor: 'pointer' }}>+ KG</button>
          </div>

          {/* Mini weight chart */}
          {weights.length >= 2 && (
            <div style={{ marginTop: 12, position: 'relative' }}>
              <MiniChart data={weights.slice(0, 14).reverse()} />
            </div>
          )}

          {/* Weight list */}
          {weights.slice(0, 7).map(w => (
            <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>
              <span style={{ fontSize: 11, color: '#555' }}>{w.logged_at}</span>
              <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 20 }}>{w.weight_kg} kg</span>
              <button onClick={() => deleteWeight(w.id)} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* PRs */}
      {data?.prs?.length > 0 && (
        <div style={{ margin: '16px 18px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>🏆 RÉCORDS PERSONALES</div>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 14 }}>
            {data.prs.map((pr: any, i: number) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < data.prs.length - 1 ? '1px solid #1a1a1a' : 'none' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{pr.exercise_name}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>{pr.reps} reps</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 22, color: '#c8ff00' }}>{pr.best_weight} kg</div>
                  <div style={{ fontSize: 9, color: '#444' }}>PR 🏆</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition stats */}
      {ns && (
        <div style={{ margin: '16px 18px 20px' }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>NUTRICIÓN (últimos 28 días)</div>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', borderRadius: 14, padding: 14, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, textAlign: 'center' }}>
            <div><div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#c8ff00' }}>{ns.avg_kcal}</div><div style={{ fontSize: 9, color: '#555', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Prom kcal</div></div>
            <div><div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#4daaff' }}>{ns.avg_protein}</div><div style={{ fontSize: 9, color: '#555', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Prom prot g</div></div>
            <div><div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 28, color: '#3ddc84' }}>{ns.days_tracked}</div><div style={{ fontSize: 9, color: '#555', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>Días log</div></div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)', background: '#111', border: '1px solid #2a2a2a', color: '#c8ff00', padding: '10px 18px', borderRadius: 9, fontWeight: 700, fontSize: 12, zIndex: 500, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Mini Components ───────────────────────────────────────
function Input({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#888', marginBottom: 5 }}>{label}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
        style={{ width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 9, padding: '10px 12px', color: '#f2f0ea', fontSize: 15, outline: 'none', WebkitAppearance: 'none' }} />
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 42, letterSpacing: 4, color: '#c8ff00' }}>BURN GT</div>
    </div>
  );
}

function MiniChart({ data }: { data: WeightLog[] }) {
  if (data.length < 2) return null;
  const vals = data.map(d => Number(d.weight_kg));
  const min = Math.min(...vals) - 0.5;
  const max = Math.max(...vals) + 0.5;
  const w = 300, h = 60, pad = 8;

  const pts = vals.map((v, i) => {
    const x = pad + (i / (vals.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2);
    return `${x},${y}`;
  });

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 60, overflow: 'visible', marginTop: 8 }}>
      <polyline points={pts.join(' ')} fill="none" stroke="#c8ff00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {vals.map((v, i) => {
        const [x, y] = pts[i].split(',');
        return <circle key={i} cx={x} cy={y} r="3" fill="#c8ff00" />;
      })}
    </svg>
  );
}
