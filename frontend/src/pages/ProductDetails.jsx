import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { addToCart } from "../services/cartService";
import { useAuth } from "../context/AuthContext";
import { successToast, errorToast } from "../utils/toast";
import { Plus, Minus, ArrowLeft, Star } from "lucide-react";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(() => errorToast("Failed to load product"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async () => {
    if (!user) {
      errorToast("Please login to add items");
      return;
    }

    try {
      await addToCart({ ...product, quantity: qty });
      successToast("Added to cart");
    } catch {
      errorToast("Failed to add item");
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center text-[#1d1d1f] mt-24 font-medium">
        Product not found
      </div>
    );
  }

  // Generate a consistent pseudo-random rating based on product ID
  const rating = 4 + (product.id.length % 10) / 10;
  const reviewCount = 40 + (product.id.length * 7 % 200);

  // Fake thumbnails for gallery effect
  const thumbnails = [product.image, product.image, product.image];

  return (
    <div className="w-full bg-[#f5f5f7] min-h-[calc(100vh-64px)] pb-24">
      
      {/* Top Bar Area */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-[15px] font-medium text-[#86868b] hover:text-[#1d1d1f] transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* ================= IMAGE SHOWCASE ================= */}
          <div className="flex flex-col gap-4">
            <div className="w-full aspect-square bg-white rounded-[32px] p-10 flex items-center justify-center border border-[rgba(0,0,0,0.04)] shadow-[0_4px_24px_rgba(0,0,0,0.02)] isolate">
              <img
                src={product.image}
                alt={product.name}
                decoding="async"
                className="w-full h-full object-contain transform-gpu will-change-transform mix-blend-multiply"
              />
            </div>
            {/* GALLERY THUMBNAILS */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {thumbnails.map((img, idx) => (
                <button 
                  key={idx} 
                  className={`w-20 h-20 shrink-0 bg-white rounded-2xl p-3 border ${idx === 0 ? 'border-[#0071e3] shadow-[0_0_0_1px_rgba(0,113,227,0.1)]' : 'border-[rgba(0,0,0,0.06)] hover:border-[rgba(0,0,0,0.15)]'} transition-all`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-contain mix-blend-multiply opacity-80" />
                </button>
              ))}
            </div>
          </div>

          {/* ================= DETAILS ================= */}
          <div className="flex flex-col py-6 lg:py-12">
            
            {product.category && (
              <span className="text-[#0071e3] font-semibold text-sm uppercase tracking-wider mb-3">
                {product.category}
              </span>
            )}

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1d1d1f] leading-tight mb-4">
              {product.name}
            </h1>

            {/* RATINGS */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    className={i < Math.floor(rating) ? "fill-[#f59e0b] text-[#f59e0b]" : "fill-[rgba(0,0,0,0.06)] text-[rgba(0,0,0,0.06)]"} 
                  />
                ))}
              </div>
              <span className="text-[14px] font-medium text-[#1d1d1f] ml-1">{rating.toFixed(1)}</span>
              <span className="text-[14px] text-[#0071e3] hover:underline cursor-pointer transition-all">
                See all {reviewCount} reviews
              </span>
            </div>

            <div className="mb-8">
              <p className="text-3xl font-semibold text-[#1d1d1f]">
                ₹{product.price}
              </p>
              <p className="text-sm text-[#86868b] mt-1">
                Inclusive of all taxes
              </p>
            </div>

            <div className="w-full h-px bg-[rgba(0,0,0,0.06)] mb-8" />

            <div className="mb-10">
              <h3 className="text-[17px] font-semibold text-[#1d1d1f] mb-3">Overview</h3>
              <p className="text-[15px] text-[#86868b] leading-relaxed">
                {product.description || "Designed to perform. This premium product offers unmatched build quality and aesthetics for your daily needs."}
              </p>
            </div>

            {/* QUANTITY AND CTA ROW */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-auto">
              
              {/* Quantity Selector */}
              <div className={`flex items-center justify-between w-full sm:w-auto bg-white border border-[rgba(0,0,0,0.06)] rounded-full h-14 px-2 ${product.stock <= 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                <button
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-medium text-[#1d1d1f]">
                  {qty}
                </span>
                <button
                  onClick={() => setQty(q => product.stock > q ? q + 1 : q)}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#86868b] hover:bg-[#f5f5f7] hover:text-[#1d1d1f] transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAdd}
                disabled={product.stock <= 0}
                className={`w-full h-14 text-[16px] rounded-2xl font-semibold transition-all ${
                  product.stock <= 0 
                    ? "bg-[#f5f5f7] text-[#86868b] cursor-not-allowed border border-[rgba(0,0,0,0.04)]" 
                    : "primary-btn"
                }`}
              >
                {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>

            {/* Guarantees */}
            <div className="mt-8 flex flex-col gap-3 text-sm text-[#86868b]">
              {product.stock <= 0 ? (
                <p className="flex items-center gap-2 text-red-500 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Currently Out of Stock
                </p>
              ) : (
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  In stock and ready to ship
                </p>
              )}
              <p className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3]"></span>
                Free delivery on premium orders
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
