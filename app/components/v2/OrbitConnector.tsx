type OrbitConnectorProps = {
  heightClassName?: string;
  variant?: "a" | "b" | "c";
  className?: string;
};

/**
 * A short vertical line with one small light point traveling along it —
 * the recurring "orbit" motif linking each stage of the hero's chaos-to-
 * orbit story. Purely decorative, so it's hidden from assistive tech.
 */
export default function OrbitConnector({
  heightClassName = "h-10",
  variant = "a",
  className = "",
}: OrbitConnectorProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative w-px shrink-0 ${heightClassName} ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-violet-400/50 via-cyan-300/30 to-transparent" />

      <span
        className={`orbit-connector-dot orbit-connector-dot-${variant} absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_8px_1px_rgba(103,232,249,0.55)]`}
      />
    </div>
  );
}
