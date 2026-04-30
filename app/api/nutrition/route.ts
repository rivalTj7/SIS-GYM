import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUserFromRequest } from '@/lib/auth';

const schema = z.object({
  description: z.string().min(2).max(500),
  servings: z.number().min(0.25).max(10).default(1),
});

type FoodEstimate = {
  food_name: string;
  serving_description: string;
  servings: number;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  confidence: 'alta' | 'media' | 'baja';
  notes: string;
  items: Array<{
    name: string;
    kcal: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
  }>;
};

const PROMPT = (description: string, servings: number) => `Eres un nutricionista experto en comida latinoamericana, especialmente guatemalteca.
El usuario describió su comida como: "${description}"
Porciones/cantidad: ${servings}

Analiza esta comida y devuelve SOLO un objeto JSON válido (sin markdown, sin backticks, sin texto extra) con esta estructura exacta:
{
  "food_name": "nombre corto del plato",
  "serving_description": "descripción de la porción estimada",
  "servings": ${servings},
  "kcal": número entero,
  "protein_g": gramos con 1 decimal,
  "carbs_g": gramos con 1 decimal,
  "fat_g": gramos con 1 decimal,
  "confidence": "alta" o "media" o "baja",
  "notes": "nota corta sobre la estimación",
  "items": [
    { "name": "ingrediente", "kcal": número, "protein_g": número, "carbs_g": número, "fat_g": número }
  ]
}

Reglas:
- Usa porciones típicas de Guatemala (pan francés ~50g, huevo mediano ~50g, salchicha ~50g, tortilla ~30g)
- Si es ambiguo usa la porción más común
- Confidence: "alta" si es específico, "media" si hay variaciones posibles, "baja" si es muy vago
- Solo JSON puro, nada más`;

export async function POST(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { description, servings } = schema.parse(body);

    // Gemini 2.0 Flash — tier gratuito
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: PROMPT(description, servings) }] }],
          generationConfig: {
            temperature: 0.2,      // bajo para respuestas consistentes
            maxOutputTokens: 1024,
            responseMimeType: 'application/json', // fuerza JSON directo
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return NextResponse.json({ error: 'Error al consultar Gemini' }, { status: 502 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let estimate: FoodEstimate;
    try {
      const clean = text.replace(/```json|```/g, '').trim();
      estimate = JSON.parse(clean);
    } catch {
      console.error('Failed to parse Gemini response:', text);
      return NextResponse.json(
        { error: 'No se pudo procesar la respuesta', raw: text },
        { status: 422 }
      );
    }

    if (!estimate.kcal || !estimate.food_name) {
      return NextResponse.json({ error: 'Respuesta incompleta' }, { status: 422 });
    }

    return NextResponse.json({ estimate });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error('Estimate error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
