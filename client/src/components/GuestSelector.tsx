'use client';

import { useState, useRef, useEffect } from 'react';

interface GuestSelectorProps {
  initialAdults?: number;
  initialChildren?: number;
  initialInfants?: number;
  initialPets?: number;
  onChange?: (guests: {
    adults: number;
    children: number;
    infants: number;
    pets: number;
  }) => void;
  className?: string;
  align?: 'left' | 'right';
}

export default function GuestSelector({
  initialAdults = 1,
  initialChildren = 0,
  initialInfants = 0,
  initialPets = 0,
  onChange,
  className = '',
  align = 'left',
}: GuestSelectorProps) {
  const [guestCounts, setGuestCounts] = useState({
    adults: initialAdults,
    children: initialChildren,
    infants: initialInfants,
    pets: initialPets,
  });

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update internal state when initial props change
  useEffect(() => {
    setGuestCounts({
      adults: initialAdults,
      children: initialChildren,
      infants: initialInfants,
      pets: initialPets,
    });
  }, [initialAdults, initialChildren, initialInfants, initialPets]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateCount = (type: keyof typeof guestCounts, value: number) => {
    const newCounts = {
      ...guestCounts,
      [type]: Math.max(0, value),
    };

    // Ensure at least 1 adult
    if (type === 'adults' && value < 1) {
      newCounts.adults = 1;
    }

    setGuestCounts(newCounts);
    onChange?.(newCounts);
  };

  const getTotalGuests = () => {
    return guestCounts.adults + guestCounts.children;
  };

  const getDisplayText = () => {
    const parts = [];
    if (getTotalGuests() > 0) {
      parts.push(
        `${getTotalGuests()} guest${getTotalGuests() !== 1 ? 's' : ''}`
      );
    }
    if (guestCounts.infants > 0) {
      parts.push(
        `${guestCounts.infants} infant${guestCounts.infants !== 1 ? 's' : ''}`
      );
    }
    if (guestCounts.pets > 0) {
      parts.push(`${guestCounts.pets} pet${guestCounts.pets !== 1 ? 's' : ''}`);
    }
    return parts.length > 0 ? parts.join(', ') : 'Add guests';
  };

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        className={`w-full p-3 border rounded-lg cursor-pointer text-sm text-left flex items-center justify-between ${
          isOpen ? 'border-rose-500' : 'border-gray-300'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>{getDisplayText()}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-5 h-5 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute ${alignmentClasses[align]} mt-2 w-72 bg-white rounded-xl shadow-lg p-4 z-10 border border-gray-100`}
          role="listbox"
        >
          <div className="space-y-4">
            {/* Adults */}
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Adults</div>
                <div className="text-xs text-gray-500">Ages 13+</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateCount('adults', guestCounts.adults - 1);
                  }}
                  disabled={guestCounts.adults <= 1}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                    guestCounts.adults <= 1
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  aria-label="Decrease adults"
                >
                  −
                </button>
                <span className="w-6 text-center" aria-live="polite">
                  {guestCounts.adults}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateCount('adults', guestCounts.adults + 1);
                  }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                  aria-label="Increase adults"
                >
                  +
                </button>
              </div>
            </div>

            {/* Children */}
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Children</div>
                <div className="text-xs text-gray-500">Ages 2-12</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateCount('children', guestCounts.children - 1);
                  }}
                  disabled={guestCounts.children <= 0}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                    guestCounts.children <= 0
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  aria-label="Decrease children"
                >
                  −
                </button>
                <span className="w-6 text-center" aria-live="polite">
                  {guestCounts.children}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateCount('children', guestCounts.children + 1);
                  }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                  aria-label="Increase children"
                >
                  +
                </button>
              </div>
            </div>

            {/* Infants */}
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Infants</div>
                <div className="text-xs text-gray-500">Under 2</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateCount('infants', guestCounts.infants - 1);
                  }}
                  disabled={guestCounts.infants <= 0}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                    guestCounts.infants <= 0
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  aria-label="Decrease infants"
                >
                  −
                </button>
                <span className="w-6 text-center" aria-live="polite">
                  {guestCounts.infants}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateCount('infants', guestCounts.infants + 1);
                  }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                  aria-label="Increase infants"
                >
                  +
                </button>
              </div>
            </div>

            {/* Pets */}
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">Pets</div>
                <div className="text-xs text-gray-500">Service animals?</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateCount('pets', guestCounts.pets - 1);
                  }}
                  disabled={guestCounts.pets <= 0}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                    guestCounts.pets <= 0
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  aria-label="Decrease pets"
                >
                  −
                </button>
                <span className="w-6 text-center" aria-live="polite">
                  {guestCounts.pets}
                </span>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    updateCount('pets', guestCounts.pets + 1);
                  }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400 transition-colors"
                  aria-label="Increase pets"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
