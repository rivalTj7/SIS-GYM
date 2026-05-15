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

const PLAN = [

// ════════════════════════════════════════════════════════════════
// LUNES — UPPER A: Empuje Dominante
// Pecho · Hombros Frontales/Laterales · Tríceps
// Objetivo del día: Cargas máximas en empuje horizontal y vertical
// ════════════════════════════════════════════════════════════════
{
  day: 'LUN', label: 'UPPER A — EMPUJE', rest: false, split: 'upperA',
  focus: 'Pecho · Hombros · Tríceps',
  coachNote: 'Día de empuje dominante. Prioridad en el press de banca y press militar. Cada semana intenta agregar 1 rep o 2.5kg. Si completás todas las reps con buena técnica, subí el peso la próxima sesión.',

  gym: {
    focus: 'Pecho · Hombros frontales y laterales · Tríceps',
    warmup: '5 min bicicleta + rotaciones de hombro + 1 serie ligera de cada ejercicio principal',
    blocks: [
      {
        t: 'BLOQUE 1 — FUERZA BASE (el más importante del día)',
        s: false,
        e: [
          {
            n: 'Press de Banca con Barra',
            muscle: 'Pecho esternal + Deltoides anterior + Tríceps',
            sets: '4', reps: '6–8', rest: 120, tempo: '3-1-1',
            v: 'rT7DgCr-3pg', vs: 'Escápulas retraídas y deprimidas. Barra baja al pecho bajo (tetillas). Arco natural.',
            tip: 'TÉCNICA CLAVE: Antes de bajar la barra, aprieta el banco con los omóplatos como si quisieras romperlo. Pies firmes en el suelo. Baja en 3 segundos contando, pausa 1 seg en el pecho, explota al subir. El primer ejercicio del día es donde ponés el mayor peso — no te guardes nada.',
            progression: 'Semanas 1-2: 50-60% de tu máximo. Semana 3+: sube 2.5kg si completás las 4×8.',
            er: [
              { l: '❌ Error #1', t: 'Rebotar la barra en el pecho para ganar inercia. Controla la bajada siempre.' },
              { l: '❌ Error #2', t: 'Nalgas que se levantan del banco. Si pasa, bajá el peso.' },
              { l: '❌ Error #3', t: 'Codos a 90° muy abiertos. Mantenelos a 45-75° del cuerpo.' }
            ]
          },
          {
            n: 'Press Militar con Barra (de pie)',
            muscle: 'Deltoides anterior + Tríceps + Core estabilizador',
            sets: '4', reps: '6–8', rest: 120, tempo: '3-1-1',
            v: 'qEwKCR5JCog', vs: 'Core apretado como si te fueran a pegar. Barra baja frente a la cara.',
            tip: 'El ejercicio que más define si tenés hombros de atleta o no. De pie activa el core como estabilizador. Agarre al ancho de hombros. Barra baja hasta la barbilla frente a la cara. Aprieta los glúteos para proteger la espalda baja.',
            progression: 'Este ejercicio progresa más lento que el press de banca. Normal. Sé paciente.',
            er: [
              { l: '❌ Error #1', t: 'Arquearse hacia atrás para empujar — se convierte en press inclinado y lesiona la zona lumbar.' },
              { l: '❌ Error #2', t: 'Barra detrás de la nuca — posición peligrosa para el manguito rotador.' }
            ]
          }
        ]
      },
      {
        t: 'BLOQUE 2 — HIPERTROFIA (volumen de pecho)',
        s: false,
        e: [
          {
            n: 'Press Inclinado con Mancuernas (30°)',
            muscle: 'Pecho clavicular (superior) + Deltoides anterior',
            sets: '3', reps: '10–12', rest: 75, tempo: '3-0-1',
            v: '8iPEnn-ltC8', vs: 'Banco a 30° máximo. Mancuernas bajan hasta sentir el estiramiento del pecho.',
            tip: 'El banco a 30° (no 45°) activa más pecho superior y menos hombro. Baja las mancuernas hasta que sientas el estiramiento completo del pecho. El rango de movimiento completo es lo que construye el músculo, no el peso.',
            er: [
              { l: '❌ Error #1', t: 'Banco a 45° o más — activa más el hombro anterior que el pecho superior.' },
              { l: '❌ Error #2', t: 'No llegar al estiramiento completo abajo. El músculo crece en el estiramiento.' }
            ]
          },
          {
            n: 'Aperturas en Cable (Peck Deck o polea)',
            muscle: 'Pecho (énfasis en aducción) + Estiramiento máximo',
            sets: '3', reps: '12–15', rest: 60, tempo: '3-1-1',
            v: 'rT7DgCr-3pg', vs: 'Movimiento de abrazo. Énfasis en el estiramiento y la contracción completa.',
            tip: 'Este ejercicio no es de fuerza — es de sentir el pecho. Usa poco peso y enfocáte en el estiramiento máximo y la contracción apretada al final. Si no sentís el pecho trabajar, el peso está muy alto.',
            er: [
              { l: '❌ Error #1', t: 'Codos completamente rectos — tensión en el bíceps. Mantenelos ligeramente doblados.' }
            ]
          }
        ]
      },
      {
        t: 'BLOQUE 3 — HOMBROS LATERALES (ancho atlético)',
        s: false,
        e: [
          {
            n: 'Elevaciones Laterales en Polea (cable lateral raise)',
            muscle: 'Deltoides medial (cabeza lateral) — define el ancho del hombro',
            sets: '4', reps: '15–20', rest: 45, tempo: '2-1-2',
            v: 'FeJbvGm_09k', vs: 'La polea da tensión constante. Brazo ligeramente doblado. Sube hasta paralelo.',
            tip: 'El deltoides medial es el músculo que da la apariencia de hombros anchos y cintura delgada — la silueta atlética en V. La polea es SUPERIOR a la mancuerna porque da tensión constante incluso abajo. 15-20 reps con peso moderado, enfocáte en sentir el quemón lateral.',
            er: [
              { l: '❌ Error #1', t: 'Subir el hombro al elevar (encogimiento). El hombro debe estar deprimido todo el tiempo.' },
              { l: '❌ Error #2', t: 'Subir más allá del paralelo — impingement del manguito rotador.' }
            ]
          },
          {
            n: 'Face Pulls con Cuerda (polea alta)',
            muscle: 'Deltoides posterior + Manguito rotador + Romboides',
            sets: '3', reps: '15–20', rest: 45, tempo: '2-2-1',
            v: 'HSoHeSjvIdY', vs: 'Hala hacia la cara separando la cuerda. Codos arriba al nivel de los hombros.',
            tip: 'El ejercicio que previene lesiones de hombro a largo plazo. El deltoides posterior y el manguito rotador son los músculos más ignorados y los que más lesiones causan. Hazlo SIEMPRE en días de empuje. Cuerda hacia la nariz separando las manos, codos arriba.',
            er: [
              { l: '❌ Error #1', t: 'Codos abajo — convierte en remo. Los codos deben estar a la altura de la cara.' }
            ]
          }
        ]
      },
      {
        t: 'BLOQUE 4 — TRÍCEPS (volumen)',
        s: true,
        e: [
          {
            n: 'Extensión en Polea con Cuerda (tricep pushdown)',
            muscle: 'Tríceps (cabeza lateral y medial)',
            sets: '3', reps: '12–15', rest: 0, tempo: '2-1-2',
            v: 'vB5OHsJ3EMc', vs: 'Codos pegados al cuerpo. Separa la cuerda al final para máxima contracción.',
            tip: 'El tríceps es ⅔ del brazo. Si querés brazos grandes, entrenás tríceps, no bíceps. Codos completamente fijos al cuerpo — son el punto de pivote. Separa la cuerda al final del movimiento para activar más la cabeza lateral.',
            er: [{ l: '❌ Error', t: 'Codos que se mueven hacia adelante y atrás. Son un punto fijo.' }]
          },
          {
            n: 'Extensión Overhead con Mancuerna (o cable)',
            muscle: 'Tríceps cabeza larga (solo se activa con el brazo sobre la cabeza)',
            sets: '3', reps: '12–15', rest: 60, tempo: '3-0-1',
            v: 'vB5OHsJ3EMc', vs: 'Mancuerna detrás de la cabeza. Codos apuntan al techo. Baja completo.',
            tip: 'La cabeza larga del tríceps (la más grande) SOLO se activa completamente cuando el brazo está elevado sobre la cabeza. Por eso este ejercicio es obligatorio — sin él, el tríceps queda incompleto.',
            er: [{ l: '❌ Error', t: 'Codos que se abren hacia los lados al bajar. Mantené los codos apuntando al techo.' }]
          }
        ]
      },
      {
        t: 'FINISHER — CARDIO METABÓLICO (no opcional)',
        s: false,
        e: [
          {
            n: 'HIIT en Caminadora o Elíptica',
            muscle: 'Sistema cardiovascular + quema calórica post-entrenamiento',
            sets: '1', reps: '20 min', rest: 0,
            v: 'xSoHPV-GSXM', vs: '30 seg al 85-90% + 90 seg al 50-55%. 8 ciclos.',
            tip: 'Protocolo HIIT: 30 seg sprint (nivel 8-9/10 de esfuerzo) + 90 seg recuperación activa (nivel 4-5). 8 ciclos = 16 min + 2 min calentamiento + 2 min vuelta a la calma. Este finisher post-fuerza genera EPOC — seguís quemando grasa hasta 24-48h después.',
            er: [{ l: '💡 Clave', t: 'Los sprints tienen que ser REALMENTE intensos. Si podés hablar normalmente, no son suficientemente intensos.' }]
          }
        ]
      }
    ]
  },

  casa: {
    focus: 'Pecho · Hombros · Tríceps · Sin equipamiento',
    warmup: '3 min trote en el lugar + rotaciones de hombro + 10 flexiones lentas de calentamiento',
    blocks: [
      {
        t: 'BLOQUE FUERZA — Empuje vertical y horizontal',
        s: false,
        e: [
          {
            n: 'Flexiones con Pausa (3-1-1 tempo)',
            muscle: 'Pecho + Tríceps + Core',
            sets: '4', reps: '8–12', rest: 90, tempo: '3-1-1',
            v: 'IODxDxX7oi4', vs: 'Baja en 3 seg, pausa 1 seg en el suelo, explota al subir.',
            tip: 'La pausa elimina el rebote y obliga al músculo a trabajar desde cero en cada rep. Cuerpo recto como tabla. Codos a 45° del cuerpo. Si hacés 12 fácil: elevá los pies en una silla.',
            er: [{ l: '❌ Error', t: 'Cadera arriba o abajo. El cuerpo debe ser una línea recta perfecta.' }]
          },
          {
            n: 'Pike Push-ups con Pies Elevados',
            muscle: 'Deltoides anterior + Tríceps (equivale al press militar)',
            sets: '4', reps: '8–10', rest: 90, tempo: '3-0-1',
            v: 'sposDXWEB0A', vs: 'Pies en silla, caderas bien arriba, cabeza baja entre los brazos.',
            tip: 'Con los pies en una silla de 40-50cm el ángulo se vuelve casi vertical — es el equivalente al press militar en casa. La clave es que las caderas estén bien altas formando una V invertida.',
            er: [{ l: '❌ Error', t: 'Caderas bajas — convierte en flexión normal, no en press vertical.' }]
          }
        ]
      },
      {
        t: 'BLOQUE HIPERTROFIA — Volumen de empuje',
        s: true,
        e: [
          {
            n: 'Flexiones Inclinadas (pies en silla)',
            muscle: 'Pecho superior + Deltoides anterior',
            sets: '3', reps: '12–15', rest: 0, tempo: '2-0-1',
            v: 'IODxDxX7oi4', vs: 'Pies elevados aproximadamente 50cm. Activa el pecho superior.',
            tip: 'El ángulo de los pies elevados replica el press inclinado. Cuanto más elevados los pies, más pecho superior. Ideal para desarrollar la zona alta del pecho que da el aspecto atlético.',
            er: []
          },
          {
            n: 'Dips en Silla (tríceps)',
            muscle: 'Tríceps + Pecho inferior',
            sets: '3', reps: '12–15', rest: 60, tempo: '3-1-1',
            v: 'l4kQd9eWclE', vs: 'Cuerpo vertical pegado a la silla. Baja hasta 90° en los codos.',
            tip: 'Para aislar el tríceps: mantené el cuerpo completamente vertical. Si te inclinás hacia adelante trabajás más el pecho inferior. Baja hasta 90°, no más para proteger el hombro.',
            er: [{ l: '❌ Error', t: 'Bajar más de 90° — tensión excesiva en el hombro anterior.' }]
          }
        ]
      },
      {
        t: 'HOMBROS LATERALES + FINISHER',
        s: false,
        e: [
          {
            n: 'Elevaciones Laterales con Botellas de Agua',
            muscle: 'Deltoides medial',
            sets: '4', reps: '20–25', rest: 45, tempo: '2-1-2',
            v: 'FeJbvGm_09k', vs: 'Botellas de 1.5L llenas. Sube hasta paralelo. Baja en 2 seg.',
            tip: 'El peso bajo requiere más reps para el estímulo correcto. 20-25 reps con botellas de 1.5L es suficiente. Enfocáte en sentir el quemón lateral en el hombro.',
            er: []
          },
          {
            n: 'Circuito Finisher: Burpees + Mountain Climbers',
            muscle: 'Full body metabólico',
            sets: '4', reps: '10 burpees + 30 seg MC', rest: 60, tempo: '',
            v: 'dZgVxmf6jkA', vs: '10 burpees sin pausa directo a 30 seg de mountain climbers. 60 seg descanso.',
            tip: 'Sin pausa entre los burpees y los mountain climbers. Este finisher replica el efecto metabólico del HIIT en caminadora.',
            er: []
          }
        ]
      }
    ]
  }
},

// ════════════════════════════════════════════════════════════════
// MARTES — LOWER A: Cuádriceps Dominante
// Sentadilla · Prensa · Extensión · Pantorrillas · HIIT pierna
// ════════════════════════════════════════════════════════════════
{
  day: 'MAR', label: 'LOWER A — CUÁDRICEPS', rest: false, split: 'lowerA',
  focus: 'Cuádriceps · Glúteos · Pantorrillas',
  coachNote: 'Las piernas son el motor del cuerpo atlético. Un error de principiante es ignorarlas o entrenarlas con poco peso. Las piernas son los músculos más grandes — entrenarlas pesado dispara la testosterona y hormona de crecimiento que beneficia TODO el cuerpo.',

  gym: {
    focus: 'Cuádriceps · Glúteos · Pantorrillas',
    warmup: '10 min bicicleta estática subiendo resistencia + sentadillas de aire lentas × 15',
    blocks: [
      {
        t: 'BLOQUE 1 — REY DEL DÍA (no lo saltes, no reduzcas el peso)',
        s: false,
        e: [
          {
            n: 'Sentadilla con Barra (Back Squat)',
            muscle: 'Cuádriceps + Glúteos + Isquiotibiales + Core + Espina erectora',
            sets: '4', reps: '6–8', rest: 180, tempo: '3-1-1',
            v: 'ultWZbUMPL8', vs: 'Pecho arriba, rodillas sobre los pies, baja hasta paralelo o por debajo.',
            tip: 'El ejercicio más poderoso del arsenal. Activa más del 70% de la musculatura corporal. TÉCNICA: barra sobre los trapecios (no el cuello), pies al ancho de hombros o ligeramente más, puntas levemente afuera 15-30°. Al bajar: rodillas siguen la dirección de los pies, pecho arriba, cadera por debajo del paralelo si la movilidad lo permite. Inhala al bajar, exhala al subir.',
            progression: 'Semanas 1-4: aprende el movimiento con barra vacía o poca carga. Esto es lo más importante.',
            er: [
              { l: '❌ Error #1', t: 'Rodillas que colapsan hacia adentro (valgo de rodilla). Empújalas hacia afuera activamente.' },
              { l: '❌ Error #2', t: 'Espalda que se redondea al bajar (butt wink). Trabajá movilidad de cadera primero.' },
              { l: '❌ Error #3', t: 'Solo bajar a 90° por miedo. La sentadilla profunda es más segura con buena técnica.' }
            ]
          }
        ]
      },
      {
        t: 'BLOQUE 2 — VOLUMEN DE CUÁDRICEPS',
        s: false,
        e: [
          {
            n: 'Prensa de Piernas (45° o horizontal)',
            muscle: 'Cuádriceps + Glúteos (varía según posición de pies)',
            sets: '4', reps: '10–12', rest: 90, tempo: '3-0-1',
            v: 'GvRgijoJ2xY', vs: 'Pies al ancho de hombros en el centro. Baja hasta 90°. Espalda pegada al respaldo.',
            tip: 'La prensa complementa la sentadilla con mayor aislamiento y volumen seguro. Posición de pies: centro = equilibrado, más arriba = más glúteo, más abajo = más cuádricep. Baja hasta 90° sin que la espalda baja se despegue del respaldo.',
            er: [
              { l: '❌ Error #1', t: 'Bloquear las rodillas al extender — impacto articular.' },
              { l: '❌ Error #2', t: 'Espalda baja que se despega al bajar demasiado — reduce el rango.' }
            ]
          },
          {
            n: 'Extensión de Cuádriceps (máquina)',
            muscle: 'Cuádriceps (aislamiento puro)',
            sets: '3', reps: '15–20', rest: 60, tempo: '2-2-1',
            v: '4ZDm5EbBAQY', vs: 'Sube explosivo. Mantén 2 seg arriba contrayendo. Baja en 2 seg.',
            tip: 'El único ejercicio de aislamiento puro del cuádriceps. No es el ejercicio principal — es el finisher de cuádriceps. Usa peso moderado y enfocáte en la contracción máxima en el tope. La pausa de 2 seg arriba duplica el tiempo bajo tensión.',
            er: [{ l: '❌ Error', t: 'Usar peso muy alto y no llegar a la extensión completa. Rango completo siempre.' }]
          }
        ]
      },
      {
        t: 'BLOQUE 3 — GLÚTEO BÁSICO',
        s: false,
        e: [
          {
            n: 'Hip Thrust con Barra (o mancuerna)',
            muscle: 'Glúteo mayor (máxima activación posible) + Isquiotibiales',
            sets: '4', reps: '10–12', rest: 90, tempo: '2-2-1',
            v: 'SEdqd1n0cvg', vs: 'Espalda en banco. Empuje desde talones. Contrae el glúteo 2 seg en el tope.',
            tip: 'El hip thrust tiene la mayor activación EMG del glúteo de todos los ejercicios existentes. Espalda sobre el banco a la altura de los omóplatos. Barra sobre la cadera (usá una almohadilla). Empujá desde los talones, no desde los dedos. Contrae el glúteo 2 seg arriba.',
            er: [
              { l: '❌ Error #1', t: 'Hiperextender la espalda baja arriba — solo mueve la pelvis.' },
              { l: '❌ Error #2', t: 'Empujar con los dedos en vez de los talones — activa más cuádriceps que glúteo.' }
            ]
          }
        ]
      },
      {
        t: 'BLOQUE 4 — PANTORRILLAS',
        s: false,
        e: [
          {
            n: 'Pantorrillas de Pie en Máquina (o escalón)',
            muscle: 'Gastrocnemio (parte visible de la pantorrilla)',
            sets: '4', reps: '15–20', rest: 45, tempo: '2-2-2',
            v: 'gwLzBJYoWlQ', vs: 'Rango COMPLETO: talón abajo del escalón, punta al máximo arriba. Pausa 2 seg.',
            tip: 'Las pantorrillas responden SOLO al rango completo y volumen alto. Sin rango completo no crecen. Talón completamente abajo del nivel del escalón al bajar, punta al máximo posible al subir. Pausa 2 seg arriba para eliminar el rebote.',
            er: [{ l: '❌ Error', t: 'Rango parcial — los talones no bajan lo suficiente. Sin rango completo no hay crecimiento.' }]
          }
        ]
      },
      {
        t: 'FINISHER — CARDIO PIERNA',
        s: false,
        e: [
          {
            n: 'Caminadora Inclinada 10-12% (Walking Pad)',
            muscle: 'Glúteos + Pantorrillas + Quema calórica sostenida',
            sets: '1', reps: '20 min', rest: 0,
            v: 'xSoHPV-GSXM', vs: 'Sin agarrarse del pasamanos. Velocidad 5.5-6 km/h. Brazos libres.',
            tip: 'Post-pierna, la caminadora inclinada activa glúteos con cada paso y quema calorías sin agotar más los músculos. NO te agarres del pasamanos — eso neutraliza el efecto. 20 min al ritmo que puedas mantener conversación.',
            er: [{ l: '💡 Clave', t: 'Inclinación alta (10-12%) es lo que hace la diferencia. Velocidad es secundaria.' }]
          }
        ]
      }
    ]
  },

  casa: {
    focus: 'Cuádriceps · Glúteos · Isquios · Sin equipamiento',
    warmup: '5 min trote + 15 sentadillas lentas + 10 zancadas por lado',
    blocks: [
      {
        t: 'FUERZA UNILATERAL (más efectivo que bilateral en casa)',
        s: false,
        e: [
          {
            n: 'Sentadilla Búlgara (Split Squat)',
            muscle: 'Cuádriceps + Glúteos (unilateral — elimina compensaciones)',
            sets: '4', reps: '8–10 por pierna', rest: 90, tempo: '3-1-1',
            v: 'QOVaHwm-Q6U', vs: 'Pie trasero en silla. Baja verticalmente. Rodilla trasera a 2cm del suelo.',
            tip: 'La sentadilla búlgara es más difícil que la sentadilla con barra y muy efectiva en casa. El trabajo unilateral revela y corrige desbalances entre piernas. Primero dominá el movimiento con tu propio peso, luego añadí mochila con libros.',
            er: [
              { l: '❌ Error #1', t: 'Inclinarse hacia adelante con el torso — glúteo en lugar de cuádricep.' },
              { l: '❌ Error #2', t: 'Rodilla delantera que pasa los dedos del pie en sentido lateral.' }
            ]
          },
          {
            n: 'Glute Bridge con Pausa (o elevado en sofá)',
            muscle: 'Glúteo mayor + Isquiotibiales',
            sets: '4', reps: '20', rest: 60, tempo: '2-3-1',
            v: 'OUgsJ8-Vi0E', vs: 'Talones pegados al suelo. Sube contrayendo el glúteo. Pausa 3 seg arriba.',
            tip: 'La pausa de 3 seg arriba es lo que lo hace efectivo sin peso. Para progresar: un solo pie, o hombros en el sofá para mayor rango de movimiento.',
            er: [{ l: '❌ Error', t: 'Empujar con los dedos del pie. El talón es el punto de contacto principal.' }]
          }
        ]
      },
      {
        t: 'CIRCUITO METABÓLICO DE PIERNA (4 vueltas)',
        s: false,
        e: [
          {
            n: 'Sentadilla con Salto',
            muscle: 'Cuádriceps + Glúteos + Sistema cardiovascular',
            sets: '4', reps: '15', rest: 0, tempo: '',
            v: 'CVaEhXotL7M', vs: 'Baja a profundidad completa. Explota. Aterriza con rodillas dobladas suave.',
            tip: 'La potencia explosiva es parte del físico atlético. No solo fuerza lenta. Los saltos entrenan el sistema neuromuscular para generar fuerza rápidamente.',
            er: [{ l: '❌ Error', t: 'Aterrizar con piernas rectas — impacto en rodillas y tobillos.' }]
          },
          {
            n: 'Zancadas en Reversa',
            muscle: 'Glúteos + Cuádriceps (más estable que zancada normal)',
            sets: '4', reps: '12 por pierna', rest: 0, tempo: '3-0-1',
            v: 'QOVaHwm-Q6U', vs: 'Paso hacia atrás. Rodilla trasera baja. Torso completamente erguido.',
            tip: 'La zancada en reversa es más controlada que la normal y reduce el estrés en la rodilla delantera. Ideal para principiantes.',
            er: []
          },
          {
            n: 'Pantorrillas en Escalón',
            muscle: 'Gastrocnemio + Sóleo',
            sets: '4', reps: '20', rest: 90, tempo: '2-2-2',
            v: 'gwLzBJYoWlQ', vs: 'Usa el borde de un escalón o una tabla gruesa. Rango completo.',
            tip: 'Sin rango completo no hay estímulo. Talón totalmente abajo, punta totalmente arriba. Pausa 2 seg en el tope.',
            er: []
          }
        ]
      }
    ]
  }
},

// ════════════════════════════════════════════════════════════════
// MIÉRCOLES — UPPER B: Tracción Dominante
// Espalda ancha y gruesa · Bíceps completo · Deltoides posterior
// ════════════════════════════════════════════════════════════════
{
  day: 'MIÉ', label: 'UPPER B — TRACCIÓN', rest: false, split: 'upperB',
  focus: 'Espalda · Bíceps · Deltoides posterior',
  coachNote: 'La espalda es el músculo que construye el físico atlético. Un pecho grande sin espalda se ve desequilibrado. La espalda ancha crea la ilusión de cintura más delgada. Prioridad: dominadas o jalones con peso correcto y rango completo.',

  gym: {
    focus: 'Dorsal ancho · Trapecio · Romboides · Bíceps · Rear delt',
    warmup: '8 min remo en máquina ergómetro a ritmo constante + estiramientos dinámicos de hombro',
    blocks: [
      {
        t: 'BLOQUE 1 — ANCLA DEL DÍA (prioridad máxima)',
        s: false,
        e: [
          {
            n: 'Jalón al Pecho (o Dominadas si podés hacer 6+)',
            muscle: 'Dorsal ancho + Bíceps + Teres mayor',
            sets: '4', reps: '6–8', rest: 120, tempo: '3-1-1',
            v: 'CAwf7n6Luuc', vs: 'Inclina 15° el torso. Baja la barra al pecho bajo. Contrae la espalda 1 seg abajo.',
            tip: 'Si podés hacer más de 6 dominadas: hacé dominadas (son superiores). Si no: jalón con peso que te cueste en las últimas 2 reps. TÉCNICA DEL JALÓN: Agarre ancho, inclina el torso 15° atrás, baja la barra al esternón (no al ombligo), codos apuntan al suelo, contrae la espalda 1 seg al final.',
            er: [
              { l: '❌ Error #1', t: 'Barra al ombligo o al abdomen — activa más bíceps que dorsal.' },
              { l: '❌ Error #2', t: 'Torso que se va muy hacia atrás (más de 30°) — se convierte en remo.' },
              { l: '❌ Error #3', t: 'No llegar a la extensión completa arriba — el dorsal no se estira.' }
            ]
          },
          {
            n: 'Remo con Barra (Barbell Row)',
            muscle: 'Espalda media + Dorsal + Bíceps + Romboides',
            sets: '4', reps: '6–8', rest: 120, tempo: '3-1-1',
            v: 'GZbfZ033f74', vs: 'Torso a 45°. Barra toca el abdomen bajo. Codos pegados al cuerpo.',
            tip: 'El remo con barra construye el grosor de la espalda (el jalón construye el ancho). Torso a 45°, barra toca el abdomen bajo, codos pegados al cuerpo durante todo el movimiento. No uses el impulso del torso — si tenés que hacerlo, el peso está muy alto.',
            er: [
              { l: '❌ Error #1', t: 'Torso que sube y baja para generar impulso (cheating). Torso fijo a 45°.' },
              { l: '❌ Error #2', t: 'Barra que toca el pecho alto — activa más deltoides posterior que espalda.' }
            ]
          }
        ]
      },
      {
        t: 'BLOQUE 2 — ESPALDA ALTA Y POSTERIOR',
        s: false,
        e: [
          {
            n: 'Remo en Polea Baja (agarre neutro o cerrado)',
            muscle: 'Romboides + Trapecio medio + Dorsal inferior',
            sets: '3', reps: '10–12', rest: 75, tempo: '3-2-1',
            v: 'GZbfZ033f74', vs: 'Codos pegados al cuerpo. Jala al abdomen. Contrae 2 seg. Espalda recta durante todo.',
            tip: 'El remo en polea permite mayor concentración en la contracción que el remo libre. Codos pegados = más dorsal. Codos hacia afuera = más espalda alta. Hoy los pegamos al cuerpo.',
            er: [{ l: '❌ Error', t: 'Inclinarse hacia atrás para jalar (inercia). Torso estático durante todo el movimiento.' }]
          },
          {
            n: 'Face Pulls + Reverse Fly combinado',
            muscle: 'Deltoides posterior + Manguito rotador + Romboides',
            sets: '3', reps: '15', rest: 60, tempo: '2-2-1',
            v: 'HSoHeSjvIdY', vs: 'Face pulls con cuerda hacia la nariz. Codos arriba y atrás.',
            tip: 'El deltoides posterior es el músculo más importante para la salud del hombro y la postura atlética. 3 series de 15 aquí y en el Upper A. Si tu hombro posterior es débil, todos los ejercicios de tracción y empuje sufren.',
            er: [{ l: '❌ Error', t: 'Codos abajo — convierte el face pull en un remo alto. Codos al nivel de los ojos.' }]
          }
        ]
      },
      {
        t: 'BLOQUE 3 — BÍCEPS COMPLETO (cabeza larga + corta + braquial)',
        s: true,
        e: [
          {
            n: 'Curl con Barra EZ (cabeza larga)',
            muscle: 'Bíceps braquial cabeza larga + Braquial',
            sets: '3', reps: '8–10', rest: 0, tempo: '3-0-1',
            v: 'av7-8igSXTs', vs: 'Codos completamente fijos al cuerpo. Baja en 3 seg hasta extensión completa.',
            tip: 'El curl estándar con barra EZ (agarre semisupino) activa mejor ambas cabezas del bíceps que la barra recta. Codos FIJOS — si se mueven, el peso está muy alto. La extensión completa abajo es obligatoria para el estiramiento máximo donde el músculo más crece.',
            er: [{ l: '❌ Error', t: 'No bajar hasta la extensión completa. El bíceps crece principalmente en la posición de estiramiento.' }]
          },
          {
            n: 'Curl Predicador con Mancuerna (cabeza corta)',
            muscle: 'Bíceps braquial cabeza corta (pico del bíceps)',
            sets: '3', reps: '10–12', rest: 60, tempo: '3-1-1',
            v: 'BZFgeQfOCGE', vs: 'Codo sobre el pad. Extensión completa abajo. Contrae 1 seg arriba.',
            tip: 'El predicador aísla el bíceps eliminando el balanceo del cuerpo. Trabaja principalmente la cabeza corta que forma el pico del bíceps. Baja completamente hasta la extensión total.',
            er: [{ l: '❌ Error', t: 'Levantar el hombro del pad al subir. El hombro permanece fijo durante todo el movimiento.' }]
          }
        ]
      },
      {
        t: 'BRAQUIAL + FINISHER CARDIO',
        s: false,
        e: [
          {
            n: 'Curl Martillo en Polea (cuerda)',
            muscle: 'Braquial + Braquiorradial (grosor del brazo)',
            sets: '3', reps: '12–15', rest: 45, tempo: '2-1-2',
            v: 'TwD-YGVP4Bk', vs: 'Agarre neutro con cuerda. Polea baja. La tensión constante es la ventaja del cable.',
            tip: 'El braquial está DEBAJO del bíceps. Si lo desarrollás, empuja el bíceps hacia arriba haciéndolo ver más grande. El agarre neutro (hammer) lo activa más que el supino. La cuerda en polea da tensión constante en todo el rango.',
            er: []
          },
          {
            n: 'HIIT en Elíptica o Bicicleta',
            muscle: 'Cardiovascular + quema calórica',
            sets: '1', reps: '20 min', rest: 0,
            v: 'xSoHPV-GSXM', vs: '30 seg intenso al 85% + 90 seg suave. 8 ciclos.',
            tip: 'Mismo protocolo que el lunes. La consistencia del cardio post-entrenamiento es lo que acelera la pérdida de grasa durante la fase de recomposición.',
            er: []
          }
        ]
      }
    ]
  },

  casa: {
    focus: 'Espalda · Bíceps · Postura atlética · Con mochila',
    warmup: '5 min de rotaciones de columna y hombro + gatos y perros',
    blocks: [
      {
        t: 'TRACCIÓN DOMINANTE EN CASA',
        s: false,
        e: [
          {
            n: 'Dominadas (si tenés barra) o Inverted Row en mesa',
            muscle: 'Dorsal + Bíceps + Espalda alta',
            sets: '4', reps: 'máx (o 10–12 inverted)', rest: 90, tempo: '3-1-1',
            v: 'eGo4IYlbE5g', vs: 'Rango completo. Pecho al bar en dominadas. Pecho a la mesa en inverted.',
            tip: 'Si podés hacer dominadas: son el mejor ejercicio de espalda sin equipamiento. Si no: el inverted row bajo una mesa firme es excelente. Acostado boca arriba, agarrá el borde de la mesa y jalá el pecho hacia el borde.',
            er: [{ l: '❌ Error', t: 'No llegar a la extensión completa abajo. El estiramiento completo del dorsal es fundamental.' }]
          },
          {
            n: 'Remo con Mochila (bilateral o unilateral)',
            muscle: 'Espalda media + Romboides + Bíceps',
            sets: '4', reps: '10–12 por lado', rest: 75, tempo: '3-2-1',
            v: 'roCP6wCXPqo', vs: 'Mochila con libros. Codo al techo. Contrae la espalda 2 seg en el tope.',
            tip: 'Llenás una mochila con libros o botellas de agua llenas. El movimiento es idéntico al remo con mancuerna del gym. Apoyá la mano libre en una mesa o silla.',
            er: []
          }
        ]
      },
      {
        t: 'BÍCEPS + FINISHER',
        s: false,
        e: [
          {
            n: 'Curl con Mochila (supino) + Curl Inverso (pronado)',
            muscle: 'Bíceps completo + Braquiorradial',
            sets: '3', reps: '12 supino + 12 pronado', rest: 60, tempo: '3-0-1',
            v: 'av7-8igSXTs', vs: 'Primero 12 reps agarre normal (palmas arriba), luego sin descanso 12 agarre invertido (palmas abajo).',
            tip: 'Dos variantes del curl con la misma mochila: supino activa el bíceps, pronado activa el braquiorradial. Un ejercicio que hace el trabajo de dos.',
            er: []
          },
          {
            n: 'Circuito Finisher Metabólico',
            muscle: 'Cardiovascular + Full body',
            sets: '4', reps: '12 burpees + 45 seg MC', rest: 75, tempo: '',
            v: 'dZgVxmf6jkA', vs: '12 burpees → sin pausa → 45 seg mountain climbers. 75 seg descanso. 4 vueltas.',
            tip: 'La consistencia de este finisher diario es lo que hace la diferencia en la recomposición corporal. No te lo saltés.',
            er: []
          }
        ]
      }
    ]
  }
},

// ════════════════════════════════════════════════════════════════
// JUEVES — LOWER B: Isquio/Glúteo Dominante
// Peso muerto · Isquiotibiales · Glúteos · Aductores · Core
// ════════════════════════════════════════════════════════════════
{
  day: 'JUE', label: 'LOWER B — CADENA POSTERIOR', rest: false, split: 'lowerB',
  focus: 'Isquiotibiales · Glúteos · Core · Peso muerto',
  coachNote: 'La cadena posterior (isquios, glúteos, espalda baja) es lo que define un atleta. No solo estéticamente — la cadena posterior fuerte previene el 80% de las lesiones deportivas. El peso muerto es el rey absoluto de la fuerza.',

  gym: {
    focus: 'Peso muerto · Isquiotibiales · Glúteos · Core profundo',
    warmup: '10 min bicicleta + peso muerto rumano con barra vacía × 15 + activación de glúteo',
    blocks: [
      {
        t: 'BLOQUE 1 — EL EJERCICIO MÁS IMPORTANTE DE TU VIDA',
        s: false,
        e: [
          {
            n: 'Peso Muerto Convencional (Deadlift)',
            muscle: 'Isquiotibiales + Glúteos + Espalda baja + Trapecios + Antebrazo (grip)',
            sets: '4', reps: '5–6', rest: 180, tempo: '3-0-1',
            v: 'op9kVnSso6Q', vs: 'Barra sobre los cordones. Espalda neutra. Empuja el suelo, no jales la barra.',
            tip: 'TÉCNICA EXACTA: Párate con la barra sobre los cordones de las zapatillas. Agachate hasta que las espinillas toquen la barra. Espalda NEUTRA (no arqueada ni redondeada). Aprieta la barra como si quisieras doblarla. Empuja el suelo con los pies hacia abajo (no jales la barra hacia arriba). La barra sube pegada a las piernas todo el tiempo. Al llegar arriba: bloquea cadera y rodillas al mismo tiempo.',
            progression: 'Semanas 1-4: aprende la técnica con poco peso. Errores en peso muerto = lesiones graves.',
            er: [
              { l: '❌ Error #1 CRÍTICO', t: 'Espalda redondeada con carga pesada — riesgo real de hernia de disco.' },
              { l: '❌ Error #2', t: 'Barra que se separa del cuerpo al subir — genera palanca y estrés lumbar.' },
              { l: '❌ Error #3', t: 'Mirar hacia arriba extremadamente — la columna cervical se comprime.' }
            ]
          }
        ]
      },
      {
        t: 'BLOQUE 2 — ISQUIOTIBIALES COMPLETOS',
        s: false,
        e: [
          {
            n: 'Peso Muerto Rumano (RDL) con Mancuernas',
            muscle: 'Isquiotibiales (estiramiento máximo) + Glúteo mayor',
            sets: '4', reps: '10–12', rest: 90, tempo: '3-1-1',
            v: 'op9kVnSso6Q', vs: 'Bisagra de cadera. Mancuernas bajan por las piernas. Sentís el estiramiento del isquio.',
            tip: 'El RDL es diferente al peso muerto — es un ejercicio de ESTIRAMIENTO del isquiotibial, no de fuerza pura. La clave es sentir el jalón en los isquios al bajar. Rodillas ligeramente dobladas y fijas. Baja hasta que sientas el estiramiento máximo (no hasta el suelo).',
            er: [
              { l: '❌ Error #1', t: 'Doblar demasiado las rodillas — se convierte en sentadilla, no en bisagra.' },
              { l: '❌ Error #2', t: 'Redondear la espalda baja al bajar — espalda neutra siempre.' }
            ]
          },
          {
            n: 'Curl de Isquiotibiales en Máquina (lying leg curl)',
            muscle: 'Isquiotibiales (contracción activa — completa el trabajo del RDL)',
            sets: '3', reps: '12–15', rest: 75, tempo: '2-2-3',
            v: 'Orxowest56U', vs: 'Baja en 3 seg. Extensión completa. Sube explosivo. El músculo crece bajando.',
            tip: 'El RDL trabaja el isquio desde el estiramiento. El curl de máquina lo trabaja desde la contracción. Juntos = estimulación completa del isquio. La bajada en 3 seg es donde más se desarrolla el músculo.',
            er: [
              { l: '❌ Error #1', t: 'Levantar las caderas al jalar — rompe el aislamiento.' },
              { l: '❌ Error #2', t: 'No llegar a la extensión completa. Rango completo siempre.' }
            ]
          }
        ]
      },
      {
        t: 'BLOQUE 3 — GLÚTEO POSTERIOR Y CORE ATLÉTICO',
        s: false,
        e: [
          {
            n: 'Sentadilla Búlgara con Mancuernas',
            muscle: 'Glúteos + Cuádriceps (énfasis glúteo si el torso va hacia adelante)',
            sets: '3', reps: '8–10 por pierna', rest: 90, tempo: '3-1-1',
            v: 'QOVaHwm-Q6U', vs: 'Pie trasero en banco. Baja verticalmente. Para más glúteo: inclina el torso ligeramente al frente.',
            tip: 'La sentadilla búlgara es uno de los ejercicios unilaterales más completos. Para enfatizar el glúteo: inclina el torso levemente al frente al bajar. Para enfatizar el cuádricep: mantén el torso vertical.',
            er: []
          },
          {
            n: 'Plancha con Variaciones (RKC o dinámica)',
            muscle: 'Core profundo: transverso abdominal + multífidos + glúteos',
            sets: '3', reps: '45 seg', rest: 60, tempo: '',
            v: 'ASdvN_XEl_c', vs: 'RKC plank: aprieta TODO al mismo tiempo. Glúteos, abdomen, cuádriceps, manos.',
            tip: 'La plancha RKC es 2-3x más difícil que la plancha normal. Técnica: posición de plancha estándar, luego aprieta SIMULTÁNEAMENTE los glúteos al máximo, el abdomen como si fueras a recibir un golpe, los cuádriceps y las manos como si quisieras apretar el suelo. 45 seg de esto equivale a minutos de plancha normal.',
            er: [{ l: '❌ Error', t: 'Plancha pasiva (solo aguantar). La plancha atlética requiere contracción activa máxima.' }]
          }
        ]
      },
      {
        t: 'FINISHER + CARDIO',
        s: false,
        e: [
          {
            n: 'Abducción de Cadera (máquina) + Caminadora Inclinada',
            muscle: 'Glúteo medio + Cardiovascular',
            sets: '1', reps: '3×20 abducción + 20 min caminadora', rest: 0,
            v: 'xSoHPV-GSXM', vs: '3 series de 20 reps de abducción, luego 20 min caminadora al 10-12%.',
            tip: 'El glúteo medio (lateral) define la forma del glúteo y la estabilidad de rodilla. 3 series rápidas y al finisher de caminadora.',
            er: []
          }
        ]
      }
    ]
  },

  casa: {
    focus: 'Cadena posterior · Isquios · Glúteos · Core',
    warmup: '5 min trote + activación de glúteo en cuadrupedia × 15 por lado',
    blocks: [
      {
        t: 'CADENA POSTERIOR EN CASA',
        s: false,
        e: [
          {
            n: 'Nordic Curl (pies bajo sofá o con compañero)',
            muscle: 'Isquiotibiales excéntrico (el más efectivo sin máquina)',
            sets: '4', reps: '5–8', rest: 120, tempo: 'excéntrico lento',
            v: '0Njz2FBOJIE', vs: 'Mete los pies bajo el sofá. Baja lentísimo frenando con los isquios. Usa las manos para subir.',
            tip: 'El nordic curl es el ejercicio de isquiotibiales más efectivo sin equipamiento. Científicamente probado. El trabajo excéntrico (frenado) es donde más crece el músculo. Baja lo más lento posible — 5-10 seg bajando. Usá las manos para el regreso.',
            er: [{ l: '❌ Error', t: 'Bajar rápido sin control. El beneficio está en el frenado lento.' }]
          },
          {
            n: 'Hip Thrust Elevado (hombros en sofá) + Pausa',
            muscle: 'Glúteo mayor (máxima activación posible en casa)',
            sets: '4', reps: '15', rest: 90, tempo: '2-3-1',
            v: 'SEdqd1n0cvg', vs: 'Hombros en el borde del sofá. Talones en el suelo. Pausa 3 seg arriba.',
            tip: 'Con los hombros elevados el rango de movimiento aumenta significativamente vs el glute bridge en el suelo. La pausa de 3 seg elimina cualquier inercia y fuerza al glúteo a sostener la contracción.',
            er: []
          }
        ]
      },
      {
        t: 'CORE ATLÉTICO (no abdominales tradicionales)',
        s: false,
        e: [
          {
            n: 'Dead Bug',
            muscle: 'Transverso abdominal + Estabilización lumbo-pélvica',
            sets: '3', reps: '10 por lado', rest: 60, tempo: '4-0-4',
            v: 'g_BYB0R-4Ws', vs: 'Espalda PEGADA al suelo. Extiende brazo y pierna contrarios LENTAMENTE. Sin arquear.',
            tip: 'El dead bug entrena el core de la forma en que se usa en el deporte y la vida real: estabilizando la columna mientras las extremidades se mueven. La espalda baja debe estar completamente pegada al suelo durante todo el ejercicio.',
            er: [{ l: '❌ Error', t: 'La espalda baja se arquea al extender las extremidades. Si pasa: reducí el rango.' }]
          },
          {
            n: 'Hollow Body Hold',
            muscle: 'Core completo (el ejercicio de core de los gimnastas)',
            sets: '3', reps: '30 seg', rest: 60, tempo: '',
            v: 'ASdvN_XEl_c', vs: 'Boca arriba. Espalda pegada al suelo. Brazos y piernas extendidos y elevados.',
            tip: 'El hollow body es la posición base de todos los atletas y gimnastas. Boca arriba, presiona la espalda baja contra el suelo y eleva brazos y piernas. Cuanto más cerca del suelo las piernas, más difícil. Empezá con 30 seg y progresá.',
            er: []
          }
        ]
      }
    ]
  }
},

// ════════════════════════════════════════════════════════════════
// VIERNES — FULL BODY POTENCIA
// Compuestos pesados + Cardio HIIT + Funcionalidad atlética
// ════════════════════════════════════════════════════════════════
{
  day: 'VIE', label: 'FULL BODY — POTENCIA', rest: false, split: 'fullbody',
  focus: 'Fuerza explosiva · Full body · HIIT · Funcional',
  coachNote: 'El viernes es el día más atlético de la semana. Combinamos los patrones de movimiento fundamentales (empuje, tracción, bisagra, sentadilla) en una sesión de alta intensidad. No es un día de aislamiento — es un día de ATLETA.',

  gym: {
    focus: 'Potencia · Compuestos · HIIT integrado',
    warmup: '5 min jump rope (o simulado) + movilidad dinámica completa',
    blocks: [
      {
        t: 'BLOQUE POTENCIA — Compuestos principales (mínimo descanso)',
        s: false,
        e: [
          {
            n: 'Peso Muerto + Remo Pendlay (complejo de barra)',
            muscle: 'Full posterior chain + Espalda + Core',
            sets: '4', reps: '5 peso muerto + 5 remo pendlay', rest: 120, tempo: '',
            v: 'op9kVnSso6Q', vs: '5 reps de peso muerto, sin soltar la barra, inclina y haz 5 remos Pendlay. Eso es 1 serie.',
            tip: 'El complejo de barra: sin soltar la barra, encadenás 5 peso muertos + 5 remos Pendlay. Esto entrena la transición atlética entre patrones de movimiento y genera una respuesta hormonal masiva. Usa el 60-70% de tu máximo en peso muerto.',
            er: [{ l: '❌ Error', t: 'Peso muy alto que compromete la técnica del remo Pendlay. Bajá el peso.' }]
          },
          {
            n: 'Press de Banca + Dominadas (superset antagonista)',
            muscle: 'Pecho + Espalda (músculos antagonistas — se recuperan mutuamente)',
            sets: '4', reps: '6 press + 6 dominadas (o jalón)', rest: 90, tempo: '3-0-1',
            v: 'rT7DgCr-3pg', vs: '6 reps de press de banca, descansás 20 seg, 6 reps de dominadas. Eso es 1 serie.',
            tip: 'El superset antagonista (pecho + espalda) permite descansar uno mientras trabajás el otro, aumentando la densidad del entrenamiento sin perder fuerza. El pecho se recupera mientras hacés las dominadas y viceversa.',
            er: []
          },
          {
            n: 'Sentadilla Frontal (o Goblet Squat con mancuerna)',
            muscle: 'Cuádriceps + Core + Estabilidad atlética',
            sets: '3', reps: '8', rest: 90, tempo: '3-1-1',
            v: 'ultWZbUMPL8', vs: 'Sentadilla con barra en posición frontal (o mancuerna al pecho). Más vertical que la sentadilla normal.',
            tip: 'La sentadilla frontal requiere más postura erecta y activación del core que la sentadilla de espalda — más atlética y funcional. Si no tenés movilidad para la barra frontal: usa el goblet squat con una mancuerna pesada al pecho.',
            er: [{ l: '❌ Error', t: 'Codos que caen — la barra se va hacia adelante y el torso se inclina.' }]
          }
        ]
      },
      {
        t: 'CIRCUITO ATLÉTICO (3 vueltas, 60 seg descanso entre vueltas)',
        s: false,
        e: [
          {
            n: 'Kettlebell Swing (o Mancuerna)',
            muscle: 'Glúteos + Isquios + Core + Cardiovascular (el más atlético)',
            sets: '3', reps: '20', rest: 0, tempo: '',
            v: 'YSxHifyI6s8', vs: 'Bisagra de cadera explosiva. La potencia viene de la cadera, no de los brazos.',
            tip: 'El swing de kettlebell replica el patrón atlético de cualquier deporte: extensión explosiva de cadera. No es una sentadilla — es una bisagra. El swing entrena potencia, resistencia, y quema una cantidad masiva de calorías.',
            er: [{ l: '❌ Error', t: 'Sentadilla en vez de bisagra — los brazos llevan el peso en lugar de la cadera.' }]
          },
          {
            n: 'Box Jump o Salto al Cajón (o salto vertical)',
            muscle: 'Potencia explosiva de pierna + Sistema nervioso',
            sets: '3', reps: '8', rest: 0, tempo: '',
            v: 'CVaEhXotL7M', vs: 'Máxima explosión. Aterriza suave en el cajón. Baja controlado.',
            tip: 'Los saltos entrenan el sistema neuromuscular para generar fuerza rápidamente — eso es lo que diferencia a un atleta de alguien que solo levanta pesas. 8 reps de máxima calidad, no de fatiga.',
            er: [{ l: '❌ Error', t: 'Saltar muchas reps seguidas sin recuperación — los saltos requieren calidad, no cantidad.' }]
          },
          {
            n: 'Remo en Máquina Ergómetro (sprint)',
            muscle: 'Full body metabólico + Cardiovascular',
            sets: '3', reps: '250m lo más rápido posible', rest: 60, tempo: '',
            v: 'H0r_ZdAcOKE', vs: '250 metros al sprint. Descansás 60 seg. 3 series.',
            tip: 'El remo al sprint activa prácticamente todos los músculos del cuerpo simultáneamente. 250m a máxima intensidad genera un estímulo cardiovascular masivo.',
            er: []
          }
        ]
      },
      {
        t: 'CORE PESADO',
        s: false,
        e: [
          {
            n: 'Rueda Abdominal (Ab Wheel) desde rodillas',
            muscle: 'Core completo + Dorsal + Hombros estabilizadores',
            sets: '4', reps: '8–10', rest: 60, tempo: '3-0-1',
            v: 'AhGCpbPf77U', vs: 'Desde rodillas. Extiende sin arquear la espalda baja. Vuelve contrayendo el abdomen.',
            tip: 'La rueda abdominal es el ejercicio de core más difícil y efectivo. Desde rodillas primero. Extiende hasta donde puedas SIN que la espalda baja se arquee. Vuelve contrayendo el abdomen, no jalando con los hombros.',
            er: [{ l: '❌ Error', t: 'Espalda baja que se arquea al extender — reduce el rango de movimiento.' }]
          },
          {
            n: 'Farmer\'s Walk (caminata con mancuernas pesadas)',
            muscle: 'Core estabilizador + Agarre + Trapecios + Resistencia',
            sets: '3', reps: '30 metros (o 30 seg)', rest: 60, tempo: '',
            v: '',
            tip: 'El ejercicio más subestimado del gimnasio. Agarrás las mancuernas más pesadas que puedas sostener y caminás derecho. Activa el core de manera funcional, fortalece el agarre, los trapecios y la resistencia total.',
            er: [{ l: '💡', t: 'Espalda recta, hombros hacia atrás y abajo, camina con pasos controlados.' }]
          }
        ]
      }
    ]
  },

  casa: {
    focus: 'Potencia · Circuito atlético · Sin equipamiento',
    warmup: '3 min saltar lazo (o simulado) + movilidad dinámica',
    blocks: [
      {
        t: 'CIRCUITO ATLÉTICO FULL BODY (5 vueltas, 90 seg descanso)',
        s: false,
        e: [
          {
            n: 'Burpees con Salto Explosivo',
            muscle: 'Full body + Cardiovascular + Potencia',
            sets: '5', reps: '10', rest: 0, tempo: '',
            v: 'dZgVxmf6jkA', vs: 'Plancha → flexión → salto vertical máximo. La altura del salto es el indicador de intensidad.',
            tip: 'El burpee es el equivalente en casa al complejo de barra del gym. Trabaja todo el cuerpo en un movimiento. La flexión es obligatoria — sin ella pierde la mitad del beneficio.',
            er: []
          },
          {
            n: 'Sentadilla con Salto + Zancada en Reversa (alternado)',
            muscle: 'Cuádriceps + Glúteos + Potencia de pierna',
            sets: '5', reps: '8 saltos + 8 zancadas', rest: 0, tempo: '',
            v: 'CVaEhXotL7M', vs: '8 sentadillas con salto, sin pausa, 8 zancadas en reversa alternando piernas.',
            tip: 'La combinación de ejercicio bilateral (sentadilla) + unilateral (zancada) en la misma serie es una estrategia atlética avanzada que maximiza el reclutamiento muscular.',
            er: []
          },
          {
            n: 'Flexiones Explosivas (clapping push-ups o normales rápidas)',
            muscle: 'Pecho + Tríceps + Potencia de empuje',
            sets: '5', reps: '8', rest: 0, tempo: '',
            v: 'IODxDxX7oi4', vs: 'Explosión total al subir. Si podés: palmada al aire. Si no: flexiones lo más explosivas posible.',
            tip: 'Las flexiones explosivas entrenan el pecho y el tríceps para generar fuerza rápidamente — el componente de potencia que completa el físico atlético.',
            er: []
          },
          {
            n: 'Mountain Climbers + Plancha RKC',
            muscle: 'Core + Cardiovascular',
            sets: '5', reps: '30 seg MC + 20 seg plancha RKC', rest: 90, tempo: '',
            v: 'nmwgirgXLYM', vs: '30 seg mountain climbers a máxima velocidad, sin pausa, 20 seg plancha apretando todo.',
            tip: 'El cierre de cada vuelta. Los mountain climbers elevan el ritmo cardíaco, la plancha RKC lo mantiene con estímulo de core. Combinación brutal.',
            er: []
          }
        ]
      }
    ]
  }
},

// ════════════════════════════════════════════════════════════════
// SÁBADO — UPPER ESPECIALIZACIÓN
// Hombros completo + Brazos + Core + Postura atlética
// ════════════════════════════════════════════════════════════════
{
  day: 'SÁB', label: 'UPPER — HOMBROS Y BRAZOS', rest: false, split: 'upperC',
  focus: 'Hombros completo · Bíceps · Tríceps · Core intenso',
  coachNote: 'El sábado es el día de especialización estética atlética. Los hombros anchos, brazos desarrollados y core fuerte son los marcadores visuales del físico atlético. No es un día de cargas máximas — es un día de volumen y conexión mente-músculo.',

  gym: {
    focus: 'Deltoides 360° · Bíceps volumen · Tríceps largo · Core',
    warmup: '8 min bicicleta + rotaciones de hombro + banda de resistencia lateral raises × 20',
    blocks: [
      {
        t: 'HOMBROS — DESARROLLO 360° (el músculo que define el físico atlético)',
        s: false,
        e: [
          {
            n: 'Press Arnold con Mancuernas (sentado)',
            muscle: 'Deltoides anterior + medial + posterior (las 3 cabezas)',
            sets: '4', reps: '10–12', rest: 75, tempo: '3-1-1',
            v: 'qEwKCR5JCog', vs: 'Empieza palmas hacia vos. Gira al subir. Termina palmas al frente.',
            tip: 'El press Arnold es superior al press militar estándar porque la rotación de muñeca activa las 3 cabezas del deltoides en lugar de solo la anterior. Sentado para eliminar el impulso. La rotación de muñeca es la clave del movimiento.',
            er: [{ l: '❌ Error', t: 'No completar la rotación de muñeca — pierde la ventaja del Arnold sobre el press normal.' }]
          },
          {
            n: 'Superset: Elevaciones Laterales + Elevaciones Frontales',
            muscle: 'Deltoides medial (lateral) + Deltoides anterior (frontal)',
            sets: '4', reps: '12 lateral + 12 frontal', rest: 60, tempo: '2-1-2',
            v: 'FeJbvGm_09k', vs: '12 elevaciones laterales directo a 12 elevaciones frontales. Sin descanso entre los dos.',
            tip: 'El superset lateral + frontal trabaja ambas cabezas del deltoides con el mismo peso sin descanso. El deltoides medial (lateral) crea el ancho; el anterior (frontal) la proyección hacia adelante. Juntos = hombros redondos y atléticos.',
            er: []
          },
          {
            n: 'Reverse Fly con Mancuernas (inclinado)',
            muscle: 'Deltoides posterior + Romboides + Trapecio medio',
            sets: '4', reps: '15–20', rest: 45, tempo: '2-2-1',
            v: 'HSoHeSjvIdY', vs: 'Torso paralelo al suelo (banco inclinado o de pie inclinado). Abre los brazos hacia los lados.',
            tip: 'El deltoides posterior completa el hombro redondo 360°. Sin él, los hombros se ven planos desde atrás. Incliná el torso hasta casi paralelo al suelo para el máximo aislamiento del deltoides posterior.',
            er: [{ l: '❌ Error', t: 'Torso muy vertical — activa más trapecio que deltoides posterior.' }]
          },
          {
            n: 'Face Pulls (cierre de hombros)',
            muscle: 'Manguito rotador + Deltoides posterior + Salud articular',
            sets: '3', reps: '20', rest: 45, tempo: '2-2-1',
            v: 'HSoHeSjvIdY', vs: 'Cierre obligatorio de todo día de hombros. Salud del manguito rotador.',
            tip: 'Siempre al final de cualquier día de hombros. Mantiene el manguito rotador sano y previene las lesiones más comunes del hombro en atletas.',
            er: []
          }
        ]
      },
      {
        t: 'BRAZOS — SUPERSETS BÍCEPS + TRÍCEPS (estilo Arnold)',
        s: true,
        e: [
          {
            n: 'Curl Inclinado con Mancuernas',
            muscle: 'Bíceps cabeza larga (máximo estiramiento en posición inclinada)',
            sets: '3', reps: '10', rest: 0, tempo: '3-0-1',
            v: 'av7-8igSXTs', vs: 'Banco a 45°. Brazos colgando. Máximo estiramiento del bíceps en el inicio.',
            tip: 'La posición inclinada pone el bíceps en la máxima posición de estiramiento al inicio — esto genera el mayor estímulo para la cabeza larga. Es científicamente uno de los ejercicios con mayor activación del bíceps.',
            er: []
          },
          {
            n: 'Press Francés con Barra EZ',
            muscle: 'Tríceps cabeza larga (más grande del tríceps)',
            sets: '3', reps: '10', rest: 75, tempo: '3-1-1',
            v: 'vB5OHsJ3EMc', vs: 'Barra EZ. Baja hacia la frente. Codos apuntan al techo y no se mueven.',
            tip: 'La cabeza larga del tríceps solo se activa completamente con el brazo elevado. Es la cabeza más grande (⅔ del tríceps total). Sin este ejercicio el tríceps queda subdesarrollado en su porción más grande.',
            er: []
          }
        ]
      },
      {
        t: 'BRAZOS — SUPERSETS VOLUMEN',
        s: true,
        e: [
          {
            n: 'Curl con Barra EZ (de pie)',
            muscle: 'Bíceps completo + Braquial',
            sets: '3', reps: '12', rest: 0, tempo: '2-1-3',
            v: 'av7-8igSXTs', vs: 'Baja en 3 seg. Énfasis en el excéntrico lento.',
            tip: 'La bajada lenta (3 seg) genera más estímulo de hipertrofia que la subida. El músculo crece más en la fase excéntrica (elongación bajo tensión).',
            er: []
          },
          {
            n: 'Extensión en Polea (agarre cuerda)',
            muscle: 'Tríceps lateral y medial',
            sets: '3', reps: '15', rest: 60, tempo: '2-1-2',
            v: 'vB5OHsJ3EMc', vs: 'Separa la cuerda al final. Codos fijos pegados al cuerpo.',
            tip: 'La cuerda permite separar las manos al final activando más la cabeza lateral del tríceps. Codos absolutamente fijos.',
            er: []
          }
        ]
      },
      {
        t: 'CORE INTENSO (no opcional — el core es parte del físico atlético)',
        s: false,
        e: [
          {
            n: 'Ab Wheel + Knee Raises en Barra + Plancha RKC',
            muscle: 'Core completo: recto + oblicuos + transverso',
            sets: '3', reps: '10 AW + 12 KR + 45 seg plancha', rest: 75, tempo: '',
            v: 'AhGCpbPf77U', vs: '10 rueda abdominal → sin pausa → 12 knee raises colgado → sin pausa → 45 seg plancha RKC.',
            tip: 'El triset de core trabaja los 3 planos del core atlético: flexión (rueda), flexión con carga en colgado (knee raises) y estabilización (plancha). Sin descanso entre los 3.',
            er: []
          }
        ]
      },
      {
        t: 'CARDIO FINISHER',
        s: false,
        e: [
          {
            n: 'HIIT Bicicleta Estática (Tabata)',
            muscle: 'Cardiovascular + Quema calórica',
            sets: '1', reps: '4 min Tabata + 10 min suave', rest: 0,
            v: 'nMNMFiCqxZ8', vs: 'Tabata: 20 seg al máximo + 10 seg descanso × 8. Luego 10 min pedaleando suave.',
            tip: 'El protocolo Tabata en bicicleta: 4 minutos de trabajo total pero son los 4 minutos más intensos de la sesión. 20 seg pedaleando al máximo absoluto + 10 seg de pausa. 8 rondas. Luego 10 min suave para la vuelta a la calma.',
            er: []
          }
        ]
      }
    ]
  },

  casa: {
    focus: 'Hombros · Brazos · Core · Sin equipamiento',
    warmup: '5 min rotaciones + calentamiento dinámico de hombro y codo',
    blocks: [
      {
        t: 'HOMBROS EN CASA (4 vueltas)',
        s: false,
        e: [
          {
            n: 'Pike Push-ups con Pies Elevados + Elevaciones Laterales con Botellas',
            muscle: 'Hombros completo',
            sets: '4', reps: '8 pike + 20 elevaciones', rest: 90, tempo: '3-0-1 / 2-1-2',
            v: 'sposDXWEB0A', vs: '8 pike push-ups con pies en silla → sin pausa → 20 elevaciones laterales con botellas 1.5L.',
            tip: 'El pike push-up trabaja el hombro en presión vertical. Las elevaciones laterales trabajan el deltoides medial para el ancho. Juntos = desarrollo completo del hombro en casa.',
            er: []
          }
        ]
      },
      {
        t: 'BRAZOS SUPERSETS EN CASA',
        s: true,
        e: [
          {
            n: 'Curl con Mochila (supino)',
            muscle: 'Bíceps',
            sets: '4', reps: '12', rest: 0, tempo: '3-1-3',
            v: 'av7-8igSXTs', vs: 'Baja en 3 seg. Pausa 1 seg abajo. Sube explosivo.',
            tip: 'El tempo 3-1-3 maximiza el tiempo bajo tensión compensando el peso limitado de la mochila.',
            er: []
          },
          {
            n: 'Dips en Silla con Pausa',
            muscle: 'Tríceps',
            sets: '4', reps: '12', rest: 75, tempo: '3-2-1',
            v: 'l4kQd9eWclE', vs: 'Baja en 3 seg. Pausa 2 seg abajo. Sube en 1 seg.',
            tip: 'La pausa de 2 seg en la posición más baja elimina la inercia y forza al tríceps a iniciar el movimiento desde cero en cada rep.',
            er: []
          }
        ]
      },
      {
        t: 'CORE + FINISHER METABÓLICO',
        s: false,
        e: [
          {
            n: 'Hollow Body + Russian Twists + Mountain Climbers',
            muscle: 'Core 360° + Cardiovascular',
            sets: '3', reps: '30 seg HB + 30 twists + 30 seg MC', rest: 90, tempo: '',
            v: 'ASdvN_XEl_c', vs: '30 seg hollow body → 30 russian twists con botella → 30 seg mountain climbers. Sin pausa entre los 3.',
            tip: 'El triset de core cubre los 3 planos: estabilización (hollow), rotación (twists), y dinámica (mountain climbers). Sin pausa entre los 3 ejercicios.',
            er: []
          }
        ]
      }
    ]
  }
},

// ════════════════════════════════════════════════════════════════
// DOMINGO — Descanso activo y recuperación
// ════════════════════════════════════════════════════════════════
{
  day: 'DOM', label: 'DESCANSO ACTIVO', rest: true, gym: null, casa: null
}

]; // FIN DEL PLAN



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
