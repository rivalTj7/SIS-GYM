export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { getAuthUserFromRequest } from '@/lib/auth';

const schema = z.object({
  description: z.string().max(500).optional().default(''),
  image: z.string().optional(),
  mimeType: z.union([
    z.literal('image/jpeg'),
    z.literal('image/png'),
    z.literal('image/gif'),
    z.literal('image/webp'),
  ]).optional().default('image/jpeg'),
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

const SYSTEM_PROMPT = `Eres nutricionista experto en comida latinoamericana y guatemalteca.
Siempre respondes ÚNICAMENTE con JSON válido, sin markdown, sin texto extra.
Usa estas referencias de porciones típicas:
- Tortilla de maíz: ~30g, 70 kcal
- Huevo mediano: ~50g, 72 kcal
- Frijoles negros cocidos: 100g, 132 kcal
- Pan francés: ~50g, 140 kcal
- Arroz cocido: 100g, 130 kcal
- Pollo a la plancha: 100g, 165 kcal`;

function buildJsonShape(servings: number): string {
  return JSON.stringify({
    food_name: 'nombre corto del plato',
    serving_description: 'descripción de la porción',
    servings,
    kcal: 0,
    protein_g: 0.0,
    carbs_g: 0.0,
    fat_g: 0.0,
    confidence: 'alta',
    notes: 'nota breve opcional',
    items: [{ name: 'ingrediente', kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }],
  }, null, 2);
}

function buildTextPrompt(desc: string, servings: number): string {
  return `Analiza esta comida y estima sus macronutrientes.

Descripción: "${desc}"
Porciones: ${servings}

Devuelve SOLO este JSON con los valores reales (sin markdown):
${buildJsonShape(servings)}

confidence: "alta" si la descripción es específica, "media" si hay variaciones posibles, "baja" si es muy vaga.`;
}

function buildImagePrompt(servings: number): string {
  return `Analiza la imagen de comida y estima los macronutrientes de todo lo que ves.

Porciones visibles: ${servings}

Identifica cada componente visible y devuelve SOLO este JSON con los valores reales (sin markdown):
${buildJsonShape(servings)}

confidence: "alta" si la comida está claramente visible, "media" si hay partes poco claras, "baja" si la imagen es poco clara.`;
}

export async function POST(req: NextRequest) {
  const auth = getAuthUserFromRequest(req);
  if (!auth) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  try {
    const body = await req.json();
    const { description, image, mimeType, servings } = schema.parse(body);

    if (!description && !image) {
      return NextResponse.json({ error: 'Se requiere descripción o imagen' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'ANTHROPIC_API_KEY no configurada' }, { status: 503 });

    const client = new Anthropic({ apiKey });

    type ContentBlock =
      | { type: 'text'; text: string }
      | { type: 'image'; source: { type: 'base64'; media_type: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'; data: string } };

    const content: ContentBlock[] = image
      ? [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: image } },
          { type: 'text', text: buildImagePrompt(servings) },
        ]
      : [{ type: 'text', text: buildTextPrompt(description, servings) }];

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content }],
    });

    const rawText = message.content
      .filter(b => b.type === 'text')
      .map(b => (b as { type: 'text'; text: string }).text)
      .join('');

    let estimate: FoodEstimate;
    try {
      estimate = JSON.parse(rawText.replace(/```json|```/g, '').trim());
    } catch {
      console.error('Parse error. Raw response:', rawText);
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
