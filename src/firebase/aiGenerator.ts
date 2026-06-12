import type { AIProductSuggestion } from '../types';

const CATEGORIES = [
  'Ropa', 'Accesorios', 'Calzado', 'Bolsos', 'Joyería',
  'Belleza', 'Deportivo', 'Casual', 'Formal', 'Infantil',
];

const TAGS_MAP: Record<string, string[]> = {
  ropa: ['moda', 'tendencia', 'outfit', 'estilo'],
  accesorios: ['complemento', 'accesorio', 'moda'],
  calzado: ['zapatos', 'calzado', 'confort'],
  bolsos: ['bolso', 'cartera', 'accesorio'],
  joyería: ['joya', 'elegante', 'brillante'],
  belleza: ['belleza', 'cuidado', 'skincare'],
  deportivo: ['sport', 'fitness', 'activewear'],
  casual: ['casual', 'diario', 'cómodo'],
  formal: ['formal', 'elegante', 'evento'],
  infantil: ['niños', 'infantil', 'kids'],
};

/**
 * AI Product Generator - analyzes an uploaded image and generates product content.
 * This implementation provides intelligent suggestions based on image metadata and filename.
 * In production, this would connect to an AI vision API (OpenAI, Google Vision, etc.)
 */
export async function generateProductFromImage(
  imageFile: File,
  apiKey?: string
): Promise<AIProductSuggestion> {
  // If an API key is configured, attempt to use OpenAI Vision API
  if (apiKey) {
    try {
      return await callAIVisionAPI(imageFile, apiKey);
    } catch {
      // Fallback to local generation if API fails
    }
  }

  // Local intelligent generation based on file metadata
  return generateLocalSuggestion(imageFile);
}

async function callAIVisionAPI(imageFile: File, apiKey: string): Promise<AIProductSuggestion> {
  const base64 = await fileToBase64(imageFile);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': ['Bearer', apiKey].join(' '),
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Eres un asistente de ecommerce de moda. Analiza la imagen del producto y genera contenido de venta en español. Responde en JSON con: title, description, shortDescription, whatsappMessage, seoTitle, seoDescription, suggestedCategory (una de: Ropa, Accesorios, Calzado, Bolsos, Joyería, Belleza, Deportivo, Casual, Formal, Infantil), suggestedTags (array de strings).',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analiza esta imagen de producto y genera contenido de venta.' },
            { type: 'image_url', image_url: { url: `data:${imageFile.type};base64,${base64}` } },
          ],
        },
      ],
      max_tokens: 1000,
    }),
  });

  if (!response.ok) throw new Error('API request failed');

  const data = await response.json();
  const content = data.choices[0]?.message?.content ?? '';

  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AIProductSuggestion;
    }
  } catch {
    // Parse error, fall through
  }

  throw new Error('Failed to parse AI response');
}

function generateLocalSuggestion(imageFile: File): AIProductSuggestion {
  const fileName = imageFile.name.toLowerCase().replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ');

  // Detect category from filename hints
  let category = 'Ropa';
  for (const cat of CATEGORIES) {
    if (fileName.includes(cat.toLowerCase())) {
      category = cat;
      break;
    }
  }

  // Detect keywords
  const keywords = fileName.split(/\s+/).filter(w => w.length > 2);
  const productName = keywords.length > 0
    ? keywords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Producto de Moda';

  const tags = TAGS_MAP[category.toLowerCase()] ?? ['moda', 'tendencia', 'boutique'];

  return {
    title: `${productName} - Melocoton Boutique`,
    description: `Descubre nuestro exclusivo ${productName.toLowerCase()}. Diseñado con los mejores materiales y atención al detalle, perfecto para cualquier ocasión. Disponible en varias tallas y colores en Melocoton Boutique.`,
    shortDescription: `✨ ${productName} ✨ Exclusivo en Melocoton Boutique 🍑 #moda #estilo #boutique`,
    whatsappMessage: `¡Hola! 👋 Te comparto este hermoso ${productName.toLowerCase()} disponible en Melocoton Boutique 🍑\n\n✅ Calidad premium\n✅ Envío a todo el país\n✅ Garantía de satisfacción\n\n¿Te interesa? Escríbenos para más info 💬`,
    seoTitle: `${productName} | Comprar en Melocoton Boutique`,
    seoDescription: `Compra ${productName.toLowerCase()} en Melocoton Boutique. Envío rápido, calidad garantizada. Descubre nuestra colección de ${category.toLowerCase()}.`,
    suggestedCategory: category,
    suggestedTags: tags,
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
