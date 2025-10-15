'use client';

import React from 'react';

export default function FlashSale({ initialMs = 2 * 60 * 60 * 1000 + 15 * 60 * 1000 + 30 * 1000 }: { initialMs?: number }) {
  const [timeLeft, setTimeLeft] = React.useState(initialMs);
  React.useEffect(() => {
    const end = Date.now() + initialMs;
    const id = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, end - now);
      setTimeLeft(left);
    }, 1000);
    return () => clearInterval(id);
  }, [initialMs]);

  const hours = String(Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
  const minutes = String(Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
  const seconds = String(Math.floor((timeLeft % (1000 * 60)) / 1000)).padStart(2, '0');

  return (
    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 flex items-center justify-between rounded-lg">
      <div className="flex items-center space-x-4">
        <h3 className="text-xl font-bold">⚡ FLASH SALE</h3>
        <div className="flex space-x-2 text-sm">
          <span className="bg-white text-red-500 px-2 py-1 rounded font-bold">{hours}</span>
          <span>:</span>
          <span className="bg-white text-red-500 px-2 py-1 rounded font-bold">{minutes}</span>
          <span>:</span>
          <span className="bg-white text-red-500 px-2 py-1 rounded font-bold">{seconds}</span>
        </div>
      </div>
      <button className="text-black hover:opacity-80">Xem tất cả →</button>
    </div>
  );
}