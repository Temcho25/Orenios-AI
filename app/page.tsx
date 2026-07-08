import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import DashboardPreview from "./components/DashboardPreview";
import Features from "./components/Features";
import Waitlist from "./components/Waitlist";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="relative overflow-hidden bg-white">

      {/* Background */}

      <div className="absolute inset-0 -z-10">

        <div className="absolute left-[-200px] top-[-120px] h-[500px] w-[500px] rounded-full bg-violet-500/20 blur-[120px]" />

        <div className="absolute right-[-150px] top-[300px] h-[450px] w-[450px] rounded-full bg-cyan-400/20 blur-[120px]" />

        <div className="absolute left-1/2 top-[900px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[140px]" />

      </div>

      <Navbar />

      <Hero />

      <DashboardPreview />

      <Features />

      <Waitlist />

      <Footer />

    </main>
  );
}