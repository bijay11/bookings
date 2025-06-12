type Home = {
  id: number;
  name: string;
  location: string;
  pricePerNight: number;
  imageUrl: string;
};

const getAvailableHomes = async (): Promise<Home[]> => {
  // Simulate dummy data for now
  return [
    {
      id: 1,
      name: 'Oceanview Cottage',
      location: 'Malibu, CA',
      pricePerNight: 350,
      imageUrl: 'https://picsum.photos/800/600?random=1',
    },
    {
      id: 2,
      name: 'Mountain Retreat',
      location: 'Aspen, CO',
      pricePerNight: 290,
      imageUrl: 'https://picsum.photos/800/600?random=2',
    },
    {
      id: 3,
      name: 'City Loft',
      location: 'New York, NY',
      pricePerNight: 420,
      imageUrl: 'https://picsum.photos/800/600?random=3',
    },
  ];
};

// export default async function Page() {
//   const res = await fetch(`${process.env.API_BASE_URL}`);
//   if (!res.ok) {
//     throw new Error('Failed to fetch data');
//   }
//   const data = await res.json();
//   return (
//     <>
//       <h1 className="text-3xl font-bold underline">{data.user}</h1>
//       <p>{data.message}</p>
//     </>
//   );
// }

export default async function Page() {
  const homes = await getAvailableHomes();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Available Homes</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {homes.map((home) => (
          <div
            key={home.id}
            className="border rounded-lg overflow-hidden shadow-lg"
          >
            <img
              src={home.imageUrl}
              alt={home.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{home.name}</h2>
              <p className="text-gray-600">{home.location}</p>
              <p className="text-lg font-bold">
                ${home.pricePerNight} per night
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
