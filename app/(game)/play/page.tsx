export default function PlayPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Play</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <GameModeCard
          title="Quick Match"
          description="Jump into a casual game"
          icon="⚡"
        />
        <GameModeCard
          title="Ranked"
          description="Climb the ladder"
          icon="🏆"
        />
      </div>
    </div>
  );
}

function GameModeCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <button className="p-8 bg-gradient-to-br from-space-purple/20 to-space-blue/20 border-2 border-space-purple/50 rounded-lg hover:border-space-cyan hover:scale-105 transition-all">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-gray-400">{description}</p>
    </button>
  );
}
