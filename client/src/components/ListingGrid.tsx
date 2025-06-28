'use client';

import Link from 'next/link';
import {HeartIcon} from './HeartIcon';

interface Listing {
  id: string | number;
  title: string;
  city: string;
  state: string;
  image_url: string;
  price_per_night: number;
  review_summary?: {
    average_rating?: number;
    total_reviews?: number;
  };
}

export default function ListingsGrid({ listings }: { listings: Listing[] }) {
  function ListingCard({ listing }: { listing: Listing }) {
    const rating = listing.review_summary?.average_rating ?? 0;
    const totalReviews = listing.review_summary?.total_reviews ?? 0;

    return (
      <Link
        href={`/listings/${listing.id}`}
        className="group rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100 hover:shadow-md transition duration-300"
      >
        <div className="relative">
          <img
            src={listing.image_url}
            alt={listing.title}
            className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Heart icon */}
          <HeartIcon id={listing.id} />

          {/* Hover overlay */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-white text-base font-semibold">
              {listing.title}
            </h3>
            <p className="text-white text-sm">
              ${listing.price_per_night}
              <span className="text-gray-300"> / night</span>
            </p>
          </div>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-500">
            {listing.city}, {listing.state}
          </p>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center text-yellow-500 text-sm">
              <span className="mr-1">★</span>
              <span className="font-medium">{rating.toFixed(1)}</span>
              <span className="text-gray-400 ml-1">({totalReviews})</span>
            </div>
            <div className="text-right text-sm text-gray-700">
              <span className="font-semibold">${listing.price_per_night}</span>
              <span className="text-gray-500"> / night</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
