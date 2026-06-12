import { useState, useRef } from 'react';
import { generateProductFromImage } from '../../firebase/aiGenerator';
import type { AIProductSuggestion } from '../../types';

export default function AIProductGenerator() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<AIProductSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setSuggestion(null);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleGenerate() {
    if (!imageFile) return;
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const result = await generateProductFromImage(imageFile, apiKey);
      setSuggestion(result);
    } catch (err) {
      console.error('AI generation error:', err);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-gray-900">Generador AI de Productos</h1>
        <p className="text-gray-500 text-sm">Sube una imagen y genera contenido automáticamente</p>
      </div>

      {/* Image Upload */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen del Producto</label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
              ) : (
                <div className="space-y-2">
                  <p className="text-4xl">📸</p>
                  <p className="text-sm text-gray-500">Haz clic para subir una imagen</p>
                  <p className="text-xs text-gray-400">Desde tu computadora o celular</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" capture="environment" />
          </div>

          <div className="flex items-center">
            <button
              onClick={handleGenerate}
              disabled={!imageFile || loading}
              className="btn btn-primary px-8 py-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Analizando...
                </span>
              ) : '🤖 Generar con AI'}
            </button>
          </div>
        </div>
      </div>

      {/* AI Results */}
      {suggestion && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700">Contenido Generado</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ResultCard
              title="Título del Producto"
              content={suggestion.title}
              onCopy={() => copyToClipboard(suggestion.title, 'title')}
              copied={copied === 'title'}
            />
            <ResultCard
              title="Descripción Completa"
              content={suggestion.description}
              onCopy={() => copyToClipboard(suggestion.description, 'description')}
              copied={copied === 'description'}
            />
            <ResultCard
              title="📱 Descripción Instagram"
              content={suggestion.shortDescription}
              onCopy={() => copyToClipboard(suggestion.shortDescription, 'instagram')}
              copied={copied === 'instagram'}
            />
            <ResultCard
              title="💬 Mensaje WhatsApp"
              content={suggestion.whatsappMessage}
              onCopy={() => copyToClipboard(suggestion.whatsappMessage, 'whatsapp')}
              copied={copied === 'whatsapp'}
            />
            <ResultCard
              title="🔍 SEO Title"
              content={suggestion.seoTitle}
              onCopy={() => copyToClipboard(suggestion.seoTitle, 'seoTitle')}
              copied={copied === 'seoTitle'}
            />
            <ResultCard
              title="🔍 SEO Description"
              content={suggestion.seoDescription}
              onCopy={() => copyToClipboard(suggestion.seoDescription, 'seoDescription')}
              copied={copied === 'seoDescription'}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="text-xs font-medium text-gray-500">Categoría Sugerida:</span>
                <span className="ml-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">{suggestion.suggestedCategory}</span>
              </div>
              <div>
                <span className="text-xs font-medium text-gray-500">Tags:</span>
                {suggestion.suggestedTags.map(tag => (
                  <span key={tag} className="ml-2 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({ title, content, onCopy, copied }: { title: string; content: string; onCopy: () => void; copied: boolean }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-sm text-gray-700">{title}</h4>
        <button onClick={onCopy} className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 transition-colors">
          {copied ? '✓ Copiado' : '📋 Copiar'}
        </button>
      </div>
      <p className="text-sm text-gray-600 whitespace-pre-wrap">{content}</p>
    </div>
  );
}
