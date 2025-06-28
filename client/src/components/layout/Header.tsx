import Link from 'next/link';

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b shadow-sm bg-white">
      <div className="text-2xl font-bold text-red-600">
        <Link href="/">Home Stay</Link>
      </div>

      <nav className="space-x-6 hidden md:block">
        <Link href="/">Home</Link>
        <Link href="/explore">Explore</Link>
        <Link href="/host" className="font-medium text-red-600">
          Become a Host
        </Link>
        <Link href="/support">Help</Link>
      </nav>

      <div className="space-x-4">
        <Link href="/signin" className="text-sm hover:underline">
          Sign In
        </Link>
        <Link href="/signup" className="text-sm hover:underline">
          Sign Up
        </Link>
      </div>
    </header>
  );
}
