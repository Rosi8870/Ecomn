import { useEffect, useState } from "react";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import { errorToast } from "../utils/toast";

const PAGE_SIZE = 12;

function Home() {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/products")
      .then(res => setProducts(res.data))
      .catch(() => errorToast("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const featured = products.filter(p => p.featured).slice(0, 8);
  const visibleProducts = products.slice(0, visibleCount);

  return (
    <div className="text-white">

      {/* ================= HERO ================= */}
      <section className="bg-black/30 border-b border-white/10" >
        <div className="max-w-7xl mx-auto px-4 py-16">
          <h1 className="text-3xl sm:text-4xl font-bold max-w-xl">
            Smart shopping for modern living
          </h1>
          <p className="text-gray-300 mt-4 max-w-lg">
            Carefully selected products. Transparent pricing.
            Built for people who value quality.
          </p>

          <div className="mt-6 flex gap-4">
            <a
              href="#featured"
              className="bg-cyan-500 px-6 py-2 rounded-lg text-sm font-semibold"
            >
              Explore products
            </a>
            <a
              href="#products"
              className="px-6 py-2 rounded-lg text-sm border border-white/20"
            >
              Browse all
            </a>
          </div>
        </div>
      </section>

      {/* ================= USP STRIP ================= */}
      <section className="bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm text-gray-300">
          <div>
            <p className="font-semibold text-white">Fast delivery</p>
            <p className="text-xs mt-1">Quick & reliable shipping</p>
          </div>
          <div>
            <p className="font-semibold text-white">Secure payments</p>
            <p className="text-xs mt-1">UPI & trusted gateways</p>
          </div>
          <div>
            <p className="font-semibold text-white">Easy returns</p>
            <p className="text-xs mt-1">Hassle-free process</p>
          </div>
          <div>
            <p className="font-semibold text-white">Quality assured</p>
            <p className="text-xs mt-1">Verified products only</p>
          </div>
        </div>
      </section>

      {/* ================= FEATURED ================= */}
      <section
        id="featured"
        className="max-w-7xl mx-auto px-4 py-14"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">
            Featured picks
          </h2>
          <span className="text-sm text-gray-400">
            Hand-selected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {featured.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ================= LIFESTYLE / STORY ================= */}
      <section className="bg-white/5 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-14 text-center">
          <h3 className="text-2xl font-semibold mb-3">
            Designed for everyday use
          </h3>
          <p className="text-gray-300 max-w-xl mx-auto text-sm">
            We focus on products that improve daily life —
            practical, durable, and fairly priced.
          </p>
        </div>
      </section>

      {/* ================= ALL PRODUCTS ================= */}
      <section
        id="products"
        className="max-w-7xl mx-auto px-4 py-14 pb-24"
      >
        <h2 className="text-xl font-bold mb-6">
          All products
        </h2>

        {loading ? (
          <p className="text-gray-400">Loading products…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {visibleProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {visibleCount < products.length && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() =>
                    setVisibleCount(c => c + PAGE_SIZE)
                  }
                  className="px-8 py-2 rounded-lg bg-white/10 hover:bg-white/20"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </section>

    </div>
  );
}

export default Home;
