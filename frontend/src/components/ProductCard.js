import { Link } from "react-router-dom";
import { addToCart } from "../services/cartService";
import { useAuth } from "../context/AuthContext";
import { successToast, errorToast } from "../utils/toast";

function ProductCard({ product }) {
  const { user } = useAuth();

  const handleAdd = async () => {
    if (!user) {
      errorToast("Login required");
      return;
    }
    await addToCart(product);
    successToast("Added to cart");
  };

  return (
    <div className="card">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square rounded-lg overflow-hidden mb-2">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
        <p className="text-sm font-medium line-clamp-2">
          {product.name}
        </p>
      </Link>

      <p className="text-cyan-300 font-bold mt-1">
        ₹{product.price}
      </p>

      <button
        onClick={handleAdd}
        className="w-full mt-2 text-sm bg-cyan-500 rounded-md py-1.5"
      >
        Add to cart
      </button>
    </div>
  );
}

export default ProductCard;
