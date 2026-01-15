import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { addToCart } from "../services/cartService";
import { useAuth } from "../context/AuthContext";
import { successToast, errorToast } from "../utils/toast";
import { Plus, Minus, ShoppingCart, ArrowLeft } from "lucide-react";

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
      <div className="min-h-[60vh] flex items-center justify-center text-white">
        Loading product…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center text-white mt-24">
        Product not found
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">

      {/* ================= BACK BUTTON ================= */}
      <button
        onClick={handleBack}
        className="
          mb-6
          inline-flex items-center gap-2
          text-sm
          text-white/70 hover:text-white
          transition
        "
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* ================= IMAGE ================= */}
        <div className="glass p-4 rounded-2xl">
          <div className="aspect-square overflow-hidden rounded-xl bg-black/10">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>

        {/* ================= INFO ================= */}
        <div className="glass p-6 rounded-2xl flex flex-col">

          {/* TITLE */}
          <h1 className="text-3xl font-bold leading-tight">
            {product.name}
          </h1>

          {/* CATEGORY */}
          {product.category && (
            <p className="text-sm text-gray-300 mt-1">
              Category · {product.category}
            </p>
          )}

          {/* PRICE */}
          <div className="mt-4">
            <p className="text-4xl font-extrabold text-cyan-300">
              ₹{product.price}
            </p>
            <p className="text-sm text-gray-300 mt-1">
              Inclusive of all taxes
            </p>
          </div>

          {/* DESCRIPTION */}
          <p className="text-gray-200 mt-6 leading-relaxed">
            {product.description || "No description available."}
          </p>

          {/* DIVIDER */}
          <div className="my-6 h-px bg-white/20" />

          {/* QUANTITY */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-medium">
              Quantity
            </span>

            <div className="flex items-center gap-3 bg-white/10 rounded-xl px-3 py-2">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                className="hover:text-cyan-300"
              >
                <Minus size={16} />
              </button>

              <span className="min-w-[20px] text-center">
                {qty}
              </span>

              <button
                onClick={() => setQty(q => q + 1)}
                className="hover:text-cyan-300"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={handleAdd}
            className="
              mt-auto
              flex items-center justify-center gap-2
              w-full
              py-4
              rounded-xl
              font-semibold
              bg-cyan-500 hover:bg-cyan-600
              transition
            "
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
