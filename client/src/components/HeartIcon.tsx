'use client';

import { useState } from 'react';
import { HeartIcon as OutlineHeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as SolidHeartIcon } from '@heroicons/react/24/solid';

export function HeartIcon({ id }: { id: string | number }) {
  const [liked, setLiked] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    setLiked((prev) => !prev);
    console.log('Wishlist toggled for:', id);
    // TODO: Call API or mutate global wishlist state
  };

  return (
    <button
      onClick={toggleWishlist}
      type="button"
      className="absolute top-3 right-3 bg-white rounded-full p-1 shadow hover:scale-105 transition"
    >
      {liked ? (
        <SolidHeartIcon className="w-5 h-5 text-rose-500" />
      ) : (
        <OutlineHeartIcon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
}
