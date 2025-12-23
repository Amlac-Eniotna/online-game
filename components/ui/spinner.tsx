
export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer pulsing ring */}
      <div className="absolute w-full h-full rounded-full border-4 border-space-cyan/20 animate-ping"></div>
      
      {/* Rotating outer ring */}
      <div className="w-16 h-16 rounded-full border-4 border-t-space-cyan border-r-transparent border-b-space-purple border-l-transparent animate-spin"></div>
      
      {/* Inner rotating ring (reverse) */}
      <div className="absolute w-10 h-10 rounded-full border-2 border-t-transparent border-r-space-purple border-b-transparent border-l-space-cyan animate-[spin_1s_linear_infinite_reverse]"></div>
      
      {/* Center dot */}
      <div className="absolute w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
    </div>
  );
}
