type AnimatedLogoProps = {
  className?: string;
  // Multiplies the default rotation speed (1 = identical to every other
  // caller: 30s outer / 18s inner, set in globals.css). Only overrides
  // animation-duration via inline style, so direction/easing/iteration
  // and the prefers-reduced-motion gating (still driven by the
  // .orbit-ring-* classes/CSS) are untouched.
  speed?: number;
};

const DEFAULT_OUTER_SECONDS = 30;
const DEFAULT_INNER_SECONDS = 18;

/**
 * Renders the original /logo2.PNG artwork unmodified, three times, each
 * copy clipped to a different concentric band (core / inner ring / outer
 * ring + satellites) measured directly from the source pixels. Rotating
 * each clipped band independently spins the real artwork — nothing here
 * is redrawn.
 */
export default function AnimatedLogo({
  className = "",
  speed = 1,
}: AnimatedLogoProps) {
  const outerDuration =
    speed === 1 ? undefined : `${(DEFAULT_OUTER_SECONDS / speed).toFixed(2)}s`;
  const innerDuration =
    speed === 1 ? undefined : `${(DEFAULT_INNER_SECONDS / speed).toFixed(2)}s`;

  return (
    <svg
      viewBox="0 0 1024 1024"
      role="img"
      aria-label="Orenios AI"
      className={className}
    >
      <defs>
        <clipPath id="orenios-clip-core">
          <circle cx="525" cy="465" r="100" />
        </clipPath>

        <clipPath id="orenios-clip-ring-inner">
          <path
            fillRule="evenodd"
            d="
              M 525,285 A 180,180 0 1,0 525,645 A 180,180 0 1,0 525,285 Z
              M 525,355 A 110,110 0 1,1 525,575 A 110,110 0 1,1 525,355 Z
            "
          />
        </clipPath>

        <clipPath id="orenios-clip-ring-outer">
          <path
            fillRule="evenodd"
            d="
              M 525,153 A 312,312 0 1,0 525,777 A 312,312 0 1,0 525,153 Z
              M 525,270 A 195,195 0 1,1 525,660 A 195,195 0 1,1 525,270 Z
            "
          />
        </clipPath>
      </defs>

      <image
        href="/logo2.PNG"
        x="0"
        y="0"
        width="1024"
        height="1024"
        clipPath="url(#orenios-clip-core)"
      />

      <g
        className="orbit-ring-inner"
        style={{
          transformOrigin: "525px 465px",
          animationDuration: innerDuration,
        }}
      >
        <image
          href="/logo2.PNG"
          x="0"
          y="0"
          width="1024"
          height="1024"
          clipPath="url(#orenios-clip-ring-inner)"
        />
      </g>

      <g
        className="orbit-ring-outer"
        style={{
          transformOrigin: "525px 465px",
          animationDuration: outerDuration,
        }}
      >
        <image
          href="/logo2.PNG"
          x="0"
          y="0"
          width="1024"
          height="1024"
          clipPath="url(#orenios-clip-ring-outer)"
        />
      </g>
    </svg>
  );
}
