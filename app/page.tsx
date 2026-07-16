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

      {/* Premium Background — continues the hero's dot-grid at a very light
          touch through the white sections below it. The hero itself paints
          over this with its own opaque background, so this layer is only
          ever visible from Features downward. Section-specific glow blobs
          live inside each section instead of here, so they stay correctly
          positioned regardless of how tall the page ends up being. */}
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