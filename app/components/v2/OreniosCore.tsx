import AnimatedLogo from "./AnimatedLogo";
import OrbitalRings from "./OrbitalRings";

/**
 * Stage 2 of the hero's chaos-to-orbit story: the real Orenios logo as
 * the "understanding" moment between raw conversation and the organized
 * result. Reuses OrbitalRings verbatim (untouched) at a smaller scale
 * rather than a bespoke halo, so the brand's actual orbit motif — not a
 * lookalike — is what appears here.
 */
export default function OreniosCore() {
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="scale-[0.32] sm:scale-[0.36]">
            <OrbitalRings />
          </div>
        </div>

        <AnimatedLogo className="relative h-14 w-14 sm:h-16 sm:w-16" />
      </div>

      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        Orenios understands
      </p>
    </div>
  );
}
