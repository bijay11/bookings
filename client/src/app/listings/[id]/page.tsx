import Image from 'next/image';
import { notFound } from 'next/navigation';
import StarIcon from '@/components/StarIcon';
import ProductImageCarousel from '@/components/ProductImageCarousel';

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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Image Gallery */}
      <div className="mb-8">
        <ProductImageCarousel images={l.images} title={l.title} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Title and Location */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {l.title}
            </h1>
            <div className="flex items-center mt-2 text-lg text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {l.city}, {l.state}
            </div>
          </div>

          {/* Price */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-semibold text-gray-900">
              ${l.price_per_night}{' '}
              <span className="text-lg font-normal text-gray-600">night</span>
            </p>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-gray-900">
              About this place
            </h2>
            <p className="text-gray-700 leading-relaxed">{l.description}</p>
          </div>

          {/* Amenities */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Amenities
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {l.amenities.map((a, i) => (
                <li key={i} className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  <span className="text-gray-700">{a}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">Reviews</h2>
              <div className="space-y-6">
                {reviews.map((review, idx) => (
                  <div
                    key={idx}
                    className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="font-semibold text-gray-900">
                          {review.reviewer}
                        </span>
                        <p className="text-sm text-gray-500">
                          {new Date(review.date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <span className="flex items-center px-2 py-1 bg-gray-100 rounded-full">
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                        <span className="ml-1 text-sm font-medium">
                          {review.rating}
                        </span>
                      </span>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            {/* Host Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Hosted by
              </h2>
              <div className="flex items-center gap-4">
                <img
                  src={l.host.avatar_url}
                  alt={l.host.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div>
                  <p className="font-semibold text-gray-900">{l.host.name}</p>
                  <p className="text-sm text-gray-500">Superhost</p>
                </div>
              </div>
            </div>

            {/* Booking Widget */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xl font-semibold text-gray-900">
                    ${l.price_per_night}{' '}
                    <span className="text-base font-normal">night</span>
                  </p>
                </div>
                <div className="flex items-center">
                  <StarIcon className="w-4 h-4 text-yellow-500" />
                  <span className="ml-1 text-sm font-medium">4.89</span>
                  <span className="mx-1">·</span>
                  <span className="text-sm text-gray-600 underline">
                    24 reviews
                  </span>
                </div>
              </div>
              <button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-medium py-3 px-4 rounded-lg transition duration-150 ease-in-out">
                Reserve
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
