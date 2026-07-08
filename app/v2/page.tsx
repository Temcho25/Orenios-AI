import Navbar from "../components/v2/Navbar";
import ProductHero from "../components/v2/ProductHero";
import ProductPreview from "../components/v2/ProductPreview";

export default function V2Page() {
  return (
    <main className="bg-white">

      <Navbar />

      <ProductHero />

      <ProductPreview />

    </main>
  );
}