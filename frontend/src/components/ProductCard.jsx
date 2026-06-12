import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { addToCart } from "../services/cartService";
import { useAuth } from "../context/AuthContext";
import { successToast, errorToast } from "../utils/toast";
import { Star, Heart } from "lucide-react";

function ProductCard({ product }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setIsLiked(saved.includes(product.id));
  }, [product.id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    let saved = JSON.parse(localStorage.getItem("wishlist") || "[]");
    
    if (isLiked) {
      saved = saved.filter(id => id !== product.id);
      successToast("Removed from wishlist");
    } else {
      saved.push(product.id);
      successToast("Added to wishlist ❤️");
    }
    
    localStorage.setItem("wishlist", JSON.stringify(saved));
    setIsLiked(!isLiked);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!user) {
      errorToast("Login required");
      return;
    }
    addToCart(product).then(() => {
      successToast("Added to cart");
    });
  };

  // Generate a consistent pseudo-random rating based on product ID
  const rating = 4 + (product.id.length % 10) / 10;
  const reviewCount = 40 + (product.id.length * 7 % 200);

  return (
    <div className="premium-card flex flex-col h-full overflow-hidden bg-white group">
      <Link to={`/product/${product.id}`} className="flex-grow flex flex-col relative h-full">
        {/* Strictly Constrained Image Container */}
        <div className="w-full relative bg-[#fbfbfd] border-b border-[rgba(0,0,0,0.04)] shrink-0 isolate" style={{ paddingBottom: '100%' }}>
          <button 
            onClick={toggleWishlist}
            className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart size={16} className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-[#86868b]'}`} />
          </button>
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full p-8 object-contain mix-blend-multiply transform-gpu will-change-transform transition-opacity duration-500 group-hover:opacity-80"
          />
        </div>
        
        {/* Content */}
        <div className="p-6 flex flex-col flex-grow relative bg-white">
          <div className="flex items-center gap-1.5 mb-2">
            <Star size={12} className="fill-[#f59e0b] text-[#f59e0b]" />
            <span className="text-[12px] font-medium text-[#1d1d1f]">{rating.toFixed(1)}</span>
            <span className="text-[12px] text-[#86868b]">({reviewCount})</span>
          </div>
          
          <p className="text-[15px] font-medium line-clamp-2 text-[#1d1d1f] mb-2 leading-tight">
            {product.name}
          </p>
          <div className="mt-auto pt-4 flex items-center justify-between">
            <p className="text-[#86868b] font-medium text-[15px]">
              ₹{product.price}
            </p>
            {/* Elegant Add to Cart Interaction */}
            {(product.stock !== undefined && product.stock <= 0) ? (
              <span className="text-[11px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md uppercase tracking-wider">
                Sold Out
              </span>
            ) : (
              <button
                onClick={handleAdd}
                className="text-[#0071e3] font-medium text-[14px] opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out"
              >
                + Add
              </button>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;
