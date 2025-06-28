// app/page.tsx or app/listings/page.tsx
import SearchBar from '@/components/SearchBar';
import ListingsGrid from '@/components/ListingGrid';

export default async function Page() {
  const listingRes = await fetch(`${process.env.API_BASE_URL}/api/listings`, {
    cache: 'no-store',
  });
  const { data } = await listingRes.json();

  return (
    <div className="container mx-auto p-4">
      <SearchBar />
      <h1 className="text-3xl font-bold mb-6">Available Homes</h1>
      <ListingsGrid listings={data} />
    </div>
  );
}
