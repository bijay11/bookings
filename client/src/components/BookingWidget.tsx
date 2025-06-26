// components/BookingWidget.tsx
'use client';

import { useState } from 'react';
import GuestSelector from './GuestSelector';

export default function BookingWidget({
  initialAdults = 1,
  initialChildren = 0,
  pricePerNight,
}: {
  initialAdults?: number;
  initialChildren?: number;
  pricePerNight: number;
}) {
  const [guests, setGuests] = useState({
    adults: initialAdults,
    children: initialChildren,
    infants: 0,
    pets: 0,
  });

  return (
    <div className="sticky top-4 border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xl font-semibold">${pricePerNight}</span>
          <span className="text-gray-600"> night</span>
        </div>
        {/* Rating display would go here */}
      </div>

      <div className="space-y-4">
        <GuestSelector
          initialAdults={guests.adults}
          initialChildren={guests.children}
          onChange={setGuests}
          className="border rounded-lg p-3"
        />

        <button
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 px-4 rounded-lg transition"
          onClick={() => alert(`Booking for ${guests.adults} adults`)}
        >
          Reserve
        </button>
      </div>

      <div className="mt-4 text-center text-gray-500 text-sm">
        You won't be charged yet
      </div>
    </div>
  );
}
