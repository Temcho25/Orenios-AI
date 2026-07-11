import Navbar from "./components/v2/Navbar";
import ProductHero from "./components/v2/ProductHero";
import Features from "./components/v2/Features";
import ProductPreview from "./components/v2/ProductPreview";
import Footer from "./components/v2/Footer";
import ScrollToTop from "./components/v2/ScrollToTop";

export default function V2Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf7ff]">
      <ScrollToTop />

      {/* Aurora Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-20 h-[500px] w-[500px] rounded-full bg-violet-500/20 blur-[110px]" />
        <div className="absolute right-[-100px] top-[280px] h-[450px] w-[450px] rounded-full bg-cyan-400/15 blur-[110px]" />
        <div className="absolute left-1/2 bottom-[-120px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-fuchsia-400/15 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <ProductHero />

        <Features />

        <ProductPreview />

        <Footer />
      </div>
    </main>
  );
}