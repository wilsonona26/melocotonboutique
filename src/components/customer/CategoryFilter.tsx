const CATEGORIES = ['Todos', 'Ropa', 'Accesorios', 'Calzado', 'Bolsos', 'Joyería'];

interface Props {
  selected: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({ selected, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(cat => (
        <button
          key={cat}
          onClick={() => onChange(cat === 'Todos' ? '' : cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            (cat === 'Todos' && !selected) || cat === selected
              ? 'bg-primary-500 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600 border border-gray-200'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
