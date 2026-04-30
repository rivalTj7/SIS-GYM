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

export async function POST(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const body = await req.json();
    const { description, servings } = schema.parse(body);

    const prompt = `Eres un nutricionista experto en comida latinoamericana, especialmente guatemalteca.
El usuario describió su comida como: "${description}"
Porciones/cantidad: ${servings}

Analiza esta comida y devuelve SOLO un objeto JSON válido (sin markdown, sin backticks, sin texto extra) con esta estructura exacta:
{
  "food_name": "nombre corto del plato o comida",
  "serving_description": "descripción de la porción estimada (ej: '2 huevos + 1 salchicha + 1 pan')  ",
  "servings": ${servings},
  "kcal": número entero de calorías totales,
  "protein_g": gramos de proteína (decimal con 1 cifra),
  "carbs_g": gramos de carbohidratos (decimal con 1 cifra),
  "fat_g": gramos de grasa (decimal con 1 cifra),
  "confidence": "alta" | "media" | "baja",
  "notes": "nota corta sobre la estimación o variaciones posibles",
  "items": [
    {
      "name": "nombre del ingrediente/item",
      "kcal": número,
      "protein_g": número,
      "carbs_g": número,
      "fat_g": número
    }
  ]
}

Reglas:
- Usa porciones típicas de Guatemala (pan francés ~50g, huevo mediano ~50g, salchicha tipo hot dog ~50g)
- Si la descripción es ambigua, usa la porción más común
- Confidence: "alta" si la comida es muy específica, "media" si hay variaciones posibles, "baja" si es muy vaga
- Los macros totales deben cuadrar con la suma de items × servings
- Solo JSON, nada más`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Claude API error:', err);
      return NextResponse.json({ error: 'Error al consultar la IA' }, { status: 502 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Parse JSON from response
    let estimate: FoodEstimate;
    try {
      // Strip any accidental markdown
      const clean = text.replace(/```json|```/g, '').trim();
      estimate = JSON.parse(clean);
    } catch {
      console.error('Failed to parse Claude response:', text);
      return NextResponse.json(
        { error: 'No se pudo procesar la respuesta de la IA', raw: text },
        { status: 422 }
      );
    }

    // Validate required fields
    if (!estimate.kcal || !estimate.food_name) {
      return NextResponse.json({ error: 'Respuesta incompleta de la IA' }, { status: 422 });
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
