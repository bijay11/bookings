export default async function Page() {
  const res = await fetch('http://localhost:8080/');
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  const data = await res.json();
  return (
    <>
      <h1>{data.user}</h1>
      <p>{data.message}</p>
    </>
  );
}
