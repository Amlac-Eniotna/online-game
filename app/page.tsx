import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-space-purple via-space-blue to-space-cyan bg-clip-text text-transparent">
          Madness Rumble Space
        </h1>
        <p className="text-xl text-gray-300">
          A chaotic multiplayer card game featuring Galaxy Misfits
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/play"
            className="px-8 py-4 bg-gradient-to-r from-space-purple to-space-blue rounded-lg font-bold text-lg hover:scale-105 transition-transform"
          >
            Play Now
          </Link>
          <Link
            href="/collection"
            className="px-8 py-4 bg-space-dark border-2 border-space-cyan rounded-lg font-bold text-lg hover:bg-space-cyan/10 transition-colors"
          >
            Collection
          </Link>
        </div>

        <div className="mt-16 text-sm text-gray-500">
          <p>Next.js 16 + Phaser + PostgreSQL + Better-Auth</p>
        </div>
      </div>
    </main>
  );
}
