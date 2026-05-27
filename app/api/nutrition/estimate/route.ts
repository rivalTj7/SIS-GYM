export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Groq from 'groq-sdk';
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
  "confidence": "alta",
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

const DEV_MOCK: FoodEstimate = {
  food_name: 'Desayuno típico guatemalteco (MODO DEV)',
  serving_description: '1 plato',
  servings: 1,
  kcal: 520,
  protein_g: 22,
  carbs_g: 58,
  fat_g: 18,
  confidence: 'alta',
  notes: 'Datos de prueba — modo desarrollo activo',
  items: [
    { name: '2 huevos fritos', kcal: 180, protein_g: 12, carbs_g: 1, fat_g: 14 },
    { name: '2 tortillas de maíz', kcal: 120, protein_g: 3, carbs_g: 26, fat_g: 1 },
    { name: 'Frijoles negros', kcal: 140, protein_g: 6, carbs_g: 25, fat_g: 1 },
    { name: 'Pan francés', kcal: 80, protein_g: 1, carbs_g: 6, fat_g: 2 },
  ],
};

export async function POST(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const body = await req.json();
    const { description, servings } = schema.parse(body);

    if (!description) {
      return NextResponse.json({ error: 'Se requiere descripción' }, { status: 400 });
    }

    // Modo desarrollo: retorna datos mock sin llamar a la IA
    if (process.env.DEV_MODE === 'true') {
      await new Promise(r => setTimeout(r, 800));
      return NextResponse.json({ estimate: { ...DEV_MOCK, servings } });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'GROQ_API_KEY no configurada' }, { status: 503 });

    const client = new Groq({ apiKey });

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: TEXT_PROMPT(description, servings) }],
      temperature: 0.2,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
    });

    const text = completion.choices[0]?.message?.content ?? '';

    let estimate: FoodEstimate;
    try {
      estimate = JSON.parse(text);
    } catch {
      console.error('Parse error:', text);
      return NextResponse.json({ error: 'No se pudo procesar la respuesta de la IA' }, { status: 422 });
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
