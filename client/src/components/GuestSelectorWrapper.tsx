// components/BookingWidget.tsx
'use client';

import { useState } from 'react';
import GuestSelector from './GuestSelector';

export function GuestSelectorWrapper({
  initialAdults = 1,
  initialChildren = 0,
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
    <div className="sticky top-4 space-y-4">
      <GuestSelector
        initialAdults={guests.adults}
        initialChildren={guests.children}
        onChange={setGuests}
      />
    </div>
  );
}
