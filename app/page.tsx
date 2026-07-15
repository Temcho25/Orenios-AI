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

      {/* Premium Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139,92,246,.18) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139,92,246,.18) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
          }}
        />

        {/* Main Glow */}
        <div className="absolute left-1/2 top-32 h-[900px] w-[900px] -translate-x-1/2 rounded-full bg-violet-400/15 blur-[180px]" />

        {/* Aurora */}
        <div className="absolute -left-32 -top-32 h-[700px] w-[700px] rounded-full bg-violet-500/28 blur-[170px]" />

        <div className="absolute right-[-180px] top-[180px] h-[650px] w-[650px] rounded-full bg-fuchsia-500/22 blur-[170px]" />

        <div className="absolute left-1/2 bottom-[-220px] h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-400/16 blur-[190px]" />

        <div className="absolute left-[18%] top-[55%] h-[350px] w-[350px] rounded-full bg-purple-400/12 blur-[140px]" />

        <div className="absolute right-[12%] bottom-[18%] h-[320px] w-[320px] rounded-full bg-indigo-400/12 blur-[140px]" />

        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-violet-300/15 to-transparent" />
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