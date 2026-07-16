import Navbar from "./components/v2/Navbar";
import ProductHero from "./components/v2/ProductHero";
import Features from "./components/v2/Features";
import ProductPreview from "./components/v2/ProductPreview";
import FounderNote from "./components/v2/FounderNote";
import Footer from "./components/v2/Footer";
import ScrollToTop from "./components/v2/ScrollToTop";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f5efff] via-[#fbf9ff] to-white">
      <ScrollToTop />

      {/* Premium Background — one continuous atmosphere layer for the whole
          page, not a different background per section. Blob positions use
          percentages of the page's own height (not fixed px), so they stay
          proportionally spread from top to bottom regardless of how tall
          the page ends up being on a given viewport. The hero paints over
          the top of this with its own opaque background, and Footer's CTA
          card paints over the bottom with its own — this layer is what
          carries the "in between" sections so nothing reads as flat white. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139,92,246,.18) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139,92,246,.18) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />

        <div className="absolute left-[8%] top-[18%] h-[620px] w-[620px] rounded-full bg-violet-400/[0.09] blur-[170px]" />
        <div className="absolute right-[6%] top-[38%] h-[560px] w-[560px] rounded-full bg-cyan-400/[0.08] blur-[160px]" />
        <div className="absolute left-[14%] top-[58%] h-[600px] w-[600px] rounded-full bg-violet-400/[0.08] blur-[170px]" />
        <div className="absolute right-[10%] top-[78%] h-[520px] w-[520px] rounded-full bg-cyan-400/[0.07] blur-[160px]" />
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