import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getActiveBanners } from '../../firebase/banners';
import type { PromoBanner } from '../../types';

export default function PromoBannerSlider() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    getActiveBanners().then(setBanners).catch(console.error);
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-2xl mx-4 mt-4">
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map(banner => (
          <Link
            key={banner.id}
            to={banner.linkUrl}
            className="min-w-full relative"
          >
            <div className="relative h-48 sm:h-64 lg:h-80 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl overflow-hidden">
              {banner.imageUrl && (
                <img src={banner.imageUrl} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-center p-6">
                <div>
                  <h2 className="text-white font-display font-bold text-2xl sm:text-4xl mb-2">{banner.title}</h2>
                  {banner.subtitle && <p className="text-white/90 text-lg">{banner.subtitle}</p>}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-white scale-110' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
