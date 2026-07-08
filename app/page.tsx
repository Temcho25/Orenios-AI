import Navbar from "./components/v2/Navbar";
import ProductHero from "./components/v2/ProductHero";
import Features from "./components/v2/Features";
import ProductPreview from "./components/v2/ProductPreview";
import Waitlist from "./components/v2/Waitlist";
import ScrollToTop from "./components/v2/ScrollToTop";

export default function V2Page() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#faf7ff]">

      <ScrollToTop />

      {/* Aurora Background */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute -left-40 -top-24 h-[700px] w-[700px] rounded-full bg-violet-500/20 blur-[220px]" />

        <div className="absolute right-[-150px] top-[350px] h-[650px] w-[650px] rounded-full bg-cyan-400/15 blur-[220px]" />

        <div className="absolute left-1/2 top-[1000px] h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-fuchsia-400/15 blur-[240px]" />

        <div className="absolute -left-40 bottom-[300px] h-[650px] w-[650px] rounded-full bg-violet-400/15 blur-[220px]" />

        <div className="absolute right-[-120px] bottom-0 h-[600px] w-[600px] rounded-full bg-cyan-300/15 blur-[220px]" />

      </div>

      <div className="relative z-10">

        <Navbar />

        <ProductHero />

        <Features />

        <ProductPreview />

        <Waitlist />

      </div>

    </main>
  );
}