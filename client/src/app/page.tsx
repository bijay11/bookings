import Link from 'next/link';
import SearchBar from '@/components/SearchBar';

export default async function Page() {
  const listingRes = await fetch(`${process.env.API_BASE_URL}/api/listings`, {
    cache: 'no-store',
  });
  const { data } = await listingRes.json();

  return (
    <div className="container mx-auto p-4">
      <SearchBar />
      <h1 className="text-3xl font-bold mb-6">Available Homes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((listing) => {
          const rating = listing.review_summary?.average_rating ?? 0;
          const totalReviews = listing.review_summary?.total_reviews ?? 0;

          return (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition duration-200 border border-gray-100"
            >
              <div
                className="h-56 bg-cover bg-center group-hover:scale-105 transition-transform duration-200"
                style={{ backgroundImage: `url(${listing.image_url})` }}
                aria-label={listing.title}
              />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-800 group-hover:underline">
                  {listing.title}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {listing.city}, {listing.state}
                </p>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center text-yellow-500 text-sm">
                    <span className="mr-1">★</span>
                    <span className="font-medium">{rating.toFixed(1)}</span>
                    <span className="text-gray-400 ml-1">({totalReviews})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-semibold text-gray-800">
                      ${listing.price_per_night}
                    </span>
                    <span className="text-sm text-gray-500"> / night</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
