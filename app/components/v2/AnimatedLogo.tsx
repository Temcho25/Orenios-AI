type AnimatedLogoProps = {
  className?: string;
};

export default function AnimatedLogo({ className = "" }: AnimatedLogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="Orenios AI"
      className={className}
    >
      <defs>
        <linearGradient
          id="orenios-logo-ring"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#22c3ff" />
        </linearGradient>

        <radialGradient
          id="orenios-logo-core"
          cx="35%"
          cy="30%"
          r="75%"
        >
          <stop offset="0%" stopColor="#ddd6fe" />
          <stop offset="55%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#4c1d95" />
        </radialGradient>
      </defs>

      {/* Outer ring + satellite — clockwise, ~30s */}
      <g className="orbit-ring-outer">
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke="url(#orenios-logo-ring)"
          strokeWidth="3"
        />
        <circle cx="50" cy="6" r="5.5" fill="url(#orenios-logo-ring)" />
      </g>

      {/* Middle ring + satellite — counter-clockwise, ~22s */}
      <g className="orbit-ring-middle">
        <circle
          cx="50"
          cy="50"
          r="32"
          fill="none"
          stroke="url(#orenios-logo-ring)"
          strokeWidth="2.2"
        />
        <circle cx="82" cy="50" r="4" fill="url(#orenios-logo-ring)" />
      </g>

      {/* Inner ring — clockwise, ~15s */}
      <g className="orbit-ring-inner">
        <circle
          cx="50"
          cy="50"
          r="22"
          fill="none"
          stroke="url(#orenios-logo-ring)"
          strokeWidth="1.8"
        />
      </g>

      {/* Static core */}
      <circle cx="50" cy="50" r="15" fill="url(#orenios-logo-core)" />
    </svg>
  );
}
