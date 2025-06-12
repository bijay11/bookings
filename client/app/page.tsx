export default async function Page() {
  const res = await fetch(`${process.env.API_BASE_URL}`);
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  const data = await res.json();
  return (
    <>
      <h1 className="text-3xl font-bold underline">{data.user}</h1>
      <p>{data.message}</p>
    </>
  );
}
