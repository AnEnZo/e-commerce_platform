'use client';

import React from 'react';
import { SLIDE_IMAGES } from '@/components/Home/constants';

export default function Slideshow() {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => setCurrentSlide(s => (s + 1) % SLIDE_IMAGES.length), 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative h-64">
      <div className="relative w-full h-full overflow-hidden">
        {SLIDE_IMAGES.map((slide, index) => (
          <div key={slide.id} className={`absolute inset-0 transition-transform duration-500 ease-in-out ${index === currentSlide ? 'translate-x-0' : index < currentSlide ? '-translate-x-full' : 'translate-x-full'}`}>
            <div className="w-full h-full relative">
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-white">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">{slide.title}</h2>
                  <p className="text-lg opacity-90">Ưu đãi cực khủng chỉ có tại Shop247</p>
                  <button className="mt-4 bg-white text-orange-500 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition-colors">
                    Mua Ngay
                  </button>
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {SLIDE_IMAGES.map((_, index) => (
          <button key={index} className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`} onClick={() => setCurrentSlide(index)} />
        ))}
      </div>

      <button className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition-colors" onClick={() => setCurrentSlide(s => (s - 1 + SLIDE_IMAGES.length) % SLIDE_IMAGES.length)}>←</button>
      <button className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/20 text-white p-2 rounded-full hover:bg-black/40 transition-colors" onClick={() => setCurrentSlide(s => (s + 1) % SLIDE_IMAGES.length)}>→</button>
    </div>
  );
}
