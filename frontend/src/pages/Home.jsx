import { useEffect, useState } from "react";
import { api } from "../services/api";
import ProductCard from "../components/ProductCard";
import { errorToast } from "../utils/toast";
import { ChevronRight, Shield, Zap, RefreshCcw } from "lucide-react";

const PAGE_SIZE = 12;

function Home() {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    api.get("/products")
      .then(res => setProducts(res.data))
      .catch(() => errorToast("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  const featured = products.filter(p => p.featured).slice(0, 4);
  
  // Compute unique categories
  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filter products by category
  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="w-full relative pb-20">
      
      {/* ================= HERO SHOWCASE ================= */}
      <section className="pt-20 pb-16 px-6 max-w-7xl mx-auto">
        <div className="premium-card overflow-hidden flex flex-col md:flex-row items-center bg-white">
          <div className="flex-1 p-10 md:p-16 z-10 text-center md:text-left">
            <span className="text-[#0071e3] font-semibold tracking-wide text-sm uppercase mb-4 block">
              Just Released
            </span>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-[#1d1d1f]">
              Pro Audio. <br /> Redeveloped.
            </h1>
            <p className="text-[#86868b] text-lg mb-8 max-w-md mx-auto md:mx-0 leading-relaxed">
              Experience the deepest bass and crystal-clear highs with our next-generation spatial audio technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="accent-btn">Buy Now</button>
              <button className="outline-btn flex items-center justify-center gap-2">
                Learn more <ChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 w-full bg-[#fbfbfd] p-10 flex items-center justify-center h-full min-h-[300px] isolate">
            <img 
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1000" 
              alt="Headphones" 
              decoding="async"
              className="w-full max-w-md object-contain transform-gpu will-change-transform transition-opacity duration-700 hover:opacity-90 mix-blend-multiply"
            />
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-10 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Fast Delivery", desc: "Free shipping on orders over ₹500.", icon: Zap },
            { title: "Secure Checkout", desc: "Your data is fully encrypted.", icon: Shield },
            { title: "Easy Returns", desc: "14-day hassle-free return policy.", icon: RefreshCcw }
          ].map((f, i) => (
            <div key={i} className="premium-card p-8 flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-[#f5f5f7] rounded-full flex items-center justify-center text-[#1d1d1f] mb-4">
                <f.icon size={24} />
              </div>
              <h3 className="font-semibold text-lg text-[#1d1d1f] mb-2">{f.title}</h3>
              <p className="text-[#86868b] text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FEATURED PRODUCTS ================= */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">Featured</h2>
          <button className="text-[#0071e3] hover:underline font-medium text-sm flex items-center gap-1">
            See all <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* ================= ALL PRODUCTS ================= */}
      <section id="products" className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-[#1d1d1f] mb-2">Explore All</h2>
            <p className="text-[#86868b]">Showing {visibleProducts.length} of {filteredProducts.length} products</p>
          </div>
          
          {/* CATEGORY PILLS */}
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => { setActiveCategory(c); setVisibleCount(PAGE_SIZE); }}
                className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
                  activeCategory === c
                    ? "bg-[#1d1d1f] text-white shadow-md"
                    : "bg-white text-[#86868b] border border-[rgba(0,0,0,0.06)] hover:border-[#1d1d1f] hover:text-[#1d1d1f]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="premium-card flex flex-col h-full bg-white group">
                <div className="w-full relative bg-[#f5f5f7] border-b border-[rgba(0,0,0,0.04)] isolate animate-pulse" style={{ paddingBottom: '100%' }}></div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="w-1/3 h-3 bg-[#f5f5f7] rounded mb-3 animate-pulse"></div>
                  <div className="w-3/4 h-4 bg-[#f5f5f7] rounded mb-2 animate-pulse"></div>
                  <div className="w-1/2 h-4 bg-[#f5f5f7] rounded mb-4 animate-pulse"></div>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="w-1/4 h-5 bg-[#f5f5f7] rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visibleProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {visibleCount < filteredProducts.length && (
              <div className="flex justify-center mt-12">
                <button
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="outline-btn"
                >
                  Show More
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
