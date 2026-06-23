import { useRef, useState } from 'react';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Props {
  images: string[];
  onUpload: (file: File) => Promise<void>;
  onRemove: (url: string) => void;
  uploading?: boolean;
}

export default function ImageUploader({ images, onUpload, onRemove, uploading = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    await onUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <PhotoIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500 text-sm">
          {uploading ? 'Subiendo imagen...' : 'Arrastra imágenes aquí o haz clic para seleccionar'}
        </p>
        <p className="text-gray-400 text-xs mt-1">PNG, JPG, WEBP hasta 5MB</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((url, i) => (
            <div key={url} className="relative group rounded-lg overflow-hidden aspect-square">
              <img src={url} alt={`Imagen ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded">
                  Principal
                </span>
              )}
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
