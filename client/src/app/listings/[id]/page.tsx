import { notFound } from 'next/navigation';
import StarIcon from '@/components/StarIcon';
import { ProductImageCarousel } from '@/components/ui/carousel';
import ReviewsModal from '@/components/ReviewsModal';
import { DateRangePicker } from '@/components/DateRangerPicker';
import { GuestSelectorWrapper } from '@/components/GuestSelectorWrapper';
import { ChatBoxWrapper } from '@/components/ui/chatbox/ChatboxWrapper';

interface Listing {
  id: number;
  title: string;
  location: {
    city: string;
    state: string;
    zip_code?: string;
  };
  pricing: {
    price_per_night: number;
  };
  description: string;
  images: string[];
  amenities: string[];
  host: {
    name: string;
    avatar_url: string;
  };
  review_summary: {
    average_rating: number;
    total_reviews: number;
  };
}

interface ListingResponse {
  data: Listing;
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch listing data
  const res = await fetch(`${process.env.INTERNAL_API_BASE_URL}/api/listings/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
  throw new Error('Failed to fetch')
}

  if (!res.ok) return notFound();

  const {
    data: {
      review_summary,
      location,
      pricing,
      description,
      images,
      title,
      host,
      amenities,
    },
  }: ListingResponse = await res.json();

  const fullStars = Math.floor(review_summary.average_rating);
  const hasHalfStar = review_summary.average_rating % 1 >= 0.5;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Image Gallery */}
      <div className="mb-8">
        <ProductImageCarousel images={images} title={title} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Title and Location */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {title}
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
              {location.city}, {location.state}
            </div>
          </div>

          {/* Reviews Summary */}
          <div className="bg-gray-200 rounded-xl p-4 mb-6">
            <ReviewsModal
              listingId={id}
              averageRating={review_summary.average_rating}
              reviewCount={review_summary.total_reviews}
              initialReviews={[]}
            >
              <div className="mb-6 cursor-pointer">
                <div className="flex items-center">
                  <div className="flex mr-2">
                    {[...Array(5)].map((_, i) => {
                      if (i < fullStars) {
                        return (
                          <StarIcon
                            key={i}
                            className="w-5 h-5 text-yellow-500 fill-current"
                          />
                        );
                      } else if (i === fullStars && hasHalfStar) {
                        return (
                          <div key={i} className="relative w-5 h-5">
                            <StarIcon className="absolute w-5 h-5 text-gray-300 fill-current" />
                            <div className="absolute w-2.5 h-5 overflow-hidden">
                              <StarIcon className="w-5 h-5 text-yellow-500 fill-current" />
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <StarIcon
                            key={i}
                            className="w-5 h-5 text-gray-300 fill-current"
                          />
                        );
                      }
                    })}
                  </div>
                  <span className="text-lg font-semibold">
                    {review_summary.average_rating}
                  </span>
                  <span className="mx-2">·</span>
                  <span className="text-gray-600 underline">
                    {review_summary.total_reviews} reviews
                  </span>
                </div>
              </div>
            </ReviewsModal>

            <ChatBoxWrapper
              id={id}
              text="Don't you have time to go through all the reviews?"
            />
          </div>

          {/* Price */}
          <div className="relative border border-gray-300 rounded-xl p-5 mb-8 bg-gradient-to-br from-white via-gray-50 to-white shadow-sm">
            <span className="absolute -top-3 left-4 bg-white px-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
              Details
            </span>

            <div className="mb-8">
              <div className="text-3xl font-bold text-gray-900 flex items-end">
                ${pricing.price_per_night}
                <span className="text-base font-normal text-gray-500 ml-1">
                  / night
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-600">
                Includes all basic amenities and taxes.
              </p>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3 text-gray-900">
                About this place
              </h2>
              <p className="text-gray-700 leading-relaxed">{description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                Amenities
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {amenities.map((a, i) => (
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
          </div>
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
                  src={host.avatar_url}
                  alt={host.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div>
                  <p className="font-semibold text-gray-900">{host.name}</p>
                  <p className="text-sm text-gray-500">Superhost</p>
                </div>
              </div>
            </div>

            {/* Booking Widget */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="mb-4">
                <p className="text-xl font-semibold text-gray-900 mb-4">
                  ${pricing.price_per_night}{' '}
                  <span className="text-base font-normal">/ night</span>
                </p>

                <DateRangePicker
                  startPlaceholder="03/27/2025"
                  endPlaceholder="03/27/2025"
                  className="mb-6"
                  startDate={new Date('2025-03-27')}
                  endDate={new Date('2025-03-27')}
                  variant="bordered"
                />
                <GuestSelectorWrapper
                  pricePerNight={pricing.price_per_night}
                  initialAdults={2}
                />
              </div>
              <button className="w-full bg-sky-500 hover:bg-sky-700 text-white font-medium py-3 px-4 rounded-lg transition duration-150 ease-in-out">
                Reserve
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
