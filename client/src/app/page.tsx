import SearchBar from '@/components/SearchBar';
import ListingsGrid from '@/components/ListingGrid';

export default async function Page() {
  const res = await fetch(`${process.env.INTERNAL_API_BASE_URL}/api/listings`, {
    cache: 'no-store',
  });

  if (!res.ok) {
  throw new Error('Failed to fetch')
}
  const { data } = await res.json();

  return (
    <div className="container mx-auto p-4">
      <SearchBar />
      <h1 className="text-3xl font-bold mb-6">Available Homes</h1>
      <ListingsGrid listings={data} />
    </div>
  );
}
