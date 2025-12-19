import Link from 'next/link';

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <nav className="bg-space-dark/80 backdrop-blur-sm border-b border-space-purple/30 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-space-purple to-space-cyan bg-clip-text text-transparent">
              MDM
            </Link>

            <div className="flex gap-6">
              <NavLink href="/play">Play</NavLink>
              <NavLink href="/collection">Collection</NavLink>
              <NavLink href="/decks">Decks</NavLink>
              <NavLink href="/shop">Shop</NavLink>
              <NavLink href="/leaderboard">Leaderboard</NavLink>
              <NavLink href="/friends">Friends</NavLink>
              <NavLink href="/profile">Profile</NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-gray-300 hover:text-space-cyan transition-colors font-medium"
    >
      {children}
    </Link>
  );
}
