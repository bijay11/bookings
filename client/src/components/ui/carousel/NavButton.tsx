'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Props {
  direction: 'prev' | 'next';
  disabled: boolean;
  onRef: (el: HTMLDivElement | null) => void;
}

export function NavButton({ direction, disabled, onRef }: Props) {
  const baseClasses =
    'absolute top-1/2 z-10 -translate-y-1/2 rounded-full w-10 h-10 flex items-center justify-center shadow-md transition';

  const side = direction === 'prev' ? 'left-4' : 'right-4';
  const icon = direction === 'prev' ? <ChevronLeftIcon className="h-6 w-6" /> : <ChevronRightIcon className="h-6 w-6" />;

  return (
    <div
      ref={onRef}
      className={`${baseClasses} ${side} ${
        disabled
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-white/80 text-gray-800 hover:bg-white cursor-pointer'
      }`}
      aria-label={direction === 'prev' ? 'Previous image' : 'Next image'}
    >
      {icon}
    </div>
  );
}
