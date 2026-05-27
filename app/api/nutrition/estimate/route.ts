export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUserFromRequest } from '@/lib/auth';

const schema = z.object({
  description: z.string().max(500).optional().default(''),
  image: z.string().optional(),
  mimeType: z.string().optional().default('image/jpeg'),
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
  items: Array<{ name: string; kcal: number; protein_g: number; carbs_g: number; fat_g: number }>;
};

const JSON_SHAPE = (servings: number) => `{
  "food_name": "nombre corto del plato",
  "serving_description": "descripción de la porción",
  "servings": ${servings},
  "kcal": 0,
  "protein_g": 0.0,
  "carbs_g": 0.0,
  "fat_g": 0.0,
  "confidence": "alta|media|baja",
  "notes": "nota breve",
  "items": [{"name":"ingrediente","kcal":0,"protein_g":0,"carbs_g":0,"fat_g":0}]
}`;

const TEXT_PROMPT = (desc: string, servings: number) =>
`Eres nutricionista experto en comida latinoamericana/guatemalteca.
Comida descrita: "${desc}" — Porciones: ${servings}

Devuelve SOLO JSON válido (sin markdown, sin texto extra):
${JSON_SHAPE(servings)}

Reglas: tortilla ~30g, huevo mediano ~50g, frijoles ~100g, pan francés ~50g.
confidence: "alta"=específico, "media"=variaciones posibles, "baja"=muy vago.`;

const IMAGE_PROMPT = (servings: number) =>
`Eres nutricionista experto en comida latinoamericana/guatemalteca.
Analiza esta imagen de comida y estima los macronutrientes de todo lo que ves.
Porciones visibles: ${servings}

Devuelve SOLO JSON válido (sin markdown, sin texto extra):
${JSON_SHAPE(servings)}

Reglas: identifica cada componente visible. Usa referencias GT/latinoamérica.
confidence: "alta"=comida claramente visible, "media"=partes poco claras, "baja"=imagen poco clara.`;

export async function POST(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 503 });

  try {
    const body = await req.json();
    const { description, image, mimeType, servings } = schema.parse(body);

    if (!description && !image) {
      return NextResponse.json({ error: 'Se requiere descripción o imagen' }, { status: 400 });
    }

    const parts: any[] = image
      ? [{ inline_data: { mime_type: mimeType, data: image } }, { text: IMAGE_PROMPT(servings) }]
      : [{ text: TEXT_PROMPT(description, servings) }];

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024, responseMimeType: 'application/json' },
        }),
      }
    );

    if (!response.ok) {
      console.error('Gemini error:', await response.text());
      return NextResponse.json({ error: 'Error al consultar Gemini' }, { status: 502 });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let estimate: FoodEstimate;
    try {
      estimate = JSON.parse(text.replace(/```json|```/g, '').trim());
    } catch {
      console.error('Parse error:', text);
      return NextResponse.json({ error: 'No se pudo procesar la respuesta' }, { status: 422 });
    }

    if (!estimate.kcal || !estimate.food_name) {
      return NextResponse.json({ error: 'Respuesta incompleta de la IA' }, { status: 422 });
    }

    return NextResponse.json({ estimate });

  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error('Estimate error:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
