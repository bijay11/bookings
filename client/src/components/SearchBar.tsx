'use client';

import { useState, useRef, useEffect } from 'react';
import { DateRangePicker } from './DateRangerPicker';

export default function SearchBar() {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [isGuestMenuOpen, setIsGuestMenuOpen] = useState(false);
  const guestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        guestRef.current &&
        !guestRef.current.contains(event.target as Node)
      ) {
        setIsGuestMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    const query = new URLSearchParams({
      destination,
      checkIn: startDate?.toISOString() || '',
      checkOut: endDate?.toISOString() || '',
      guests: guests.toString(),
    }).toString();

    window.location.href = `/search?${query}`;
  };

  const handleGuestMenuToggle = () => {
    setIsGuestMenuOpen(!isGuestMenuOpen);
  };

  return (
    <div className="flex flex-col md:flex-row items-stretch bg-white rounded-full md:rounded-full shadow-md border border-gray-200 max-w-5xl mx-auto mt-6 p-1 md:p-1">
      {/* Location */}
      <div className="px-4 py-2 md:border-r border-gray-200 flex-1 min-w-0">
        <div className="text-xs font-semibold text-gray-800">Where</div>
        <input
          type="text"
          placeholder="Search destinations"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full outline-none text-sm placeholder-gray-400"
        />
      </div>

      {/* Date Range Picker */}
      <div className="px-4 py-2 md:border-r border-gray-200 flex-1 min-w-0">
        <DateRangePicker
          onDatesChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
          className="hidden md:flex"
          align="center"
        />
        {/* Mobile version */}
        <div className="md:hidden flex flex-col">
          <div className="text-xs font-semibold text-gray-800">Dates</div>
          <div className="text-sm text-gray-500">
            {startDate && endDate
              ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
              : 'Add dates'}
          </div>
        </div>
      </div>

      {/* Guests */}
      <div className="px-4 py-2 relative flex-1 min-w-0" ref={guestRef}>
        <div className="text-xs font-semibold text-gray-800">Who</div>
        <div
          className="text-sm cursor-pointer flex items-center"
          onClick={handleGuestMenuToggle}
        >
          {guests === 1 ? '1 guest' : `${guests} guests`}
        </div>
        {isGuestMenuOpen && (
          <div className="absolute top-full left-0 right-0 md:left-auto md:right-0 mt-2 w-full md:w-64 bg-white rounded-xl shadow-lg p-4 z-10">
            <div className="flex justify-between items-center mb-4">
              <div>
                <div className="font-medium">Adults</div>
                <div className="text-xs text-gray-500">Ages 13 or above</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGuests(Math.max(1, guests - 1));
                  }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                >
                  -
                </button>
                <span>{guests}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setGuests(guests + 1);
                  }}
                  className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search Button */}
      <button
        onClick={handleSearch}
        className="bg-rose-500 text-white p-2 px-4 rounded-full hover:bg-rose-600 transition-colors mt-2 md:mt-0 md:ml-2 self-center md:self-auto flex items-center gap-2"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z"
            clipRule="evenodd"
          />
        </svg>
        <span className="text-sm font-medium">Search</span>
      </button>
    </div>
  );
}
