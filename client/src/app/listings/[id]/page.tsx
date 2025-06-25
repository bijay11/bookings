// app/listing/[id]/page.tsx
import Image from 'next/image';
import { notFound } from 'next/navigation';
import StarIcon from '@/components/StarIcon';

interface Listing {
  id: number;
  title: string;
  city: string;
  state: string;
  price_per_night: number;
  description: string;
  images: string[];
  amenities: string[];
  host: {
    name: string;
    avatar_url: string;
  };
}

interface Review {
  reviewer: string;
  comment: string;
  rating: number;
  date: string;
}

interface ListingResponse {
  data: Listing;
}

interface ReviewResponse {
  reviews: Review[];
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Await the params promise before using its properties
  const { id } = await params;

  const resListing = await fetch(`http://localhost:8080/api/listings/${id}`, {
    cache: 'no-store',
  });
  const resReview = await fetch(
    `http://localhost:8080/api/listings/${id}/reviews`,
    {
      cache: 'no-store',
    }
  );

  if (!resListing.ok) return notFound();
  const listingJson: ListingResponse = await resListing.json();
  const reviewsJson: ReviewResponse = await resReview.json();

  const l = listingJson.data;
  const reviews = reviewsJson.reviews;

  return (
    <main className="max-w-6xl mx-auto p-6">
      {/* Hero Image Carousel */}
      <div className="rounded-2xl shadow-lg overflow-hidden mb-8 grid grid-cols-2 gap-2">
        {l.images.map((img, i) => (
          <div key={i} className="relative aspect-video w-full">
            <Image
              src={img}
              alt={`${l.title} image ${i + 1}`}
              fill
              className="object-cover rounded-xl"
              sizes="50vw"
            />
          </div>
        ))}
      </div>

      <h1 className="text-4xl font-bold">{l.title}</h1>
      <p className="text-gray-500 text-lg">
        {l.city}, {l.state}
      </p>
      <p className="mt-2 text-xl font-semibold">${l.price_per_night} / night</p>

      <p className="mt-4 text-gray-700">{l.description}</p>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Amenities</h2>
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-gray-600 list-disc list-inside">
          {l.amenities.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex items-center gap-4">
        <img
          src={l.host.avatar_url}
          alt={l.host.name}
          className="w-14 h-14 rounded-full object-cover"
        />
        <div>
          <p className="font-semibold text-gray-800">{l.host.name}</p>
          <p className="text-sm text-gray-500">Host</p>
        </div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="p-4 bg-white border rounded-xl shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{review.reviewer}</span>
                  <span className="flex items-center text-yellow-500">
                    <StarIcon />
                    <span className="ml-1 text-sm">{review.rating}</span>
                  </span>
                </div>
                <p className="mt-2 text-gray-600">{review.comment}</p>
                <p className="text-xs text-gray-400">
                  {new Date(review.date).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
