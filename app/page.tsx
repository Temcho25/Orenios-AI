import Navbar from "./components/v2/Navbar";
import ProductHero from "./components/v2/ProductHero";
import Features from "./components/v2/Features";
import ProductPreview from "./components/v2/ProductPreview";
import FounderNote from "./components/v2/FounderNote";
import Footer from "./components/v2/Footer";
import ScrollToTop from "./components/v2/ScrollToTop";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08070f]">
      <ScrollToTop />

      {/* Premium Background — one continuous dark atmosphere layer for the
          whole page, matching the hero's own aurora treatment, so there is
          no light/dark seam anywhere. Blob positions use percentages of the
          page's own height (not fixed px), so they stay proportionally
          spread from top to bottom regardless of how tall the page ends up
          being on a given viewport. Every section below is transparent and
          lets this layer show through end to end. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)
            `,
            backgroundSize: "56px 56px",
          }}
        />

        <div className="absolute left-[8%] top-[12%] h-[620px] w-[620px] rounded-full bg-violet-500/[0.16] blur-[170px]" />
        <div className="absolute right-[6%] top-[30%] h-[560px] w-[560px] rounded-full bg-cyan-400/[0.13] blur-[160px]" />
        <div className="absolute left-[12%] top-[50%] h-[560px] w-[560px] rounded-full bg-fuchsia-500/[0.11] blur-[170px]" />
        <div className="absolute right-[10%] top-[70%] h-[560px] w-[560px] rounded-full bg-violet-500/[0.15] blur-[160px]" />
        <div className="absolute left-[10%] top-[90%] h-[520px] w-[520px] rounded-full bg-cyan-400/[0.13] blur-[160px]" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <ProductHero />
        <Features />
        <ProductPreview />
        <FounderNote />
        <Footer />
      </div>
    </main>
  );
}