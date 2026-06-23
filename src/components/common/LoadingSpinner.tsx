interface Props {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export default function LoadingSpinner({ size = 'md', fullScreen = false }: Props) {
  const sizeClasses = { sm: 'w-5 h-5', md: 'w-10 h-10', lg: 'w-16 h-16' };
  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizeClasses[size]} border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin`} />
      {size === 'lg' && <p className="text-primary-500 font-medium">Cargando...</p>}
    </div>
  );
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }
  return <div className="flex justify-center items-center p-8">{spinner}</div>;
}
