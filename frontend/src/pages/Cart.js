import { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";

import {
  getCart,
  updateQuantity,
  removeFromCart,
} from "../services/cartService";

import { placeOrder, submitPayment } from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import { successToast, errorToast } from "../utils/toast";

import AddressModal from "../components/AddressModal";
import UpiPaymentModal from "../components/UpiPaymentModal";

function Cart() {
  const { user } = useAuth();

  const [cart, setCart] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [showUpi, setShowUpi] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);

  useEffect(() => {
    if (!user) return;
    getCart()
      .then(res => setCart(res.data))
      .catch(() => errorToast("Failed to load cart"));
  }, [user]);

  if (!user) {
    return (
      <div className="text-center text-white mt-24">
        Please login to view your cart
      </div>
    );
  }

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const delivery = subtotal > 0 ? 0 : 0;
  const total = subtotal + delivery;

  const handleIncrease = async (item) => {
    await updateQuantity(item.id, item.quantity + 1);
    setCart(prev =>
      prev.map(i =>
        i.id === item.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      )
    );
  };

  const handleDecrease = async (item) => {
    if (item.quantity === 1) {
      await removeFromCart(item.id);
      setCart(prev => prev.filter(i => i.id !== item.id));
    } else {
      await updateQuantity(item.id, item.quantity - 1);
      setCart(prev =>
        prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
      );
    }
  };

  const handleAddressSubmit = async (address) => {
    try {
      const txnId = `UPI_${Date.now()}`;
      const res = await placeOrder(
        cart,
        total,
        txnId,
        address,
        user.uid
      );

      setOrderInfo({
        orderId: res.data.orderId,
        amount: total,
      });

      setShowAddress(false);
      setShowUpi(true);
    } catch {
      errorToast("Order failed");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-32 text-white">

      {/* ===== HEADER ===== */}
      <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
      <p className="text-gray-300 mb-8">
        {cart.length} items ready for checkout
      </p>

      {/* ===== CHECKOUT STEPS ===== */}
      <div className="flex items-center gap-3 mb-10 text-sm">
        <Step active label="Cart" />
        <Line />
        <Step label="Address" />
        <Line />
        <Step label="Payment" />
      </div>

      {cart.length === 0 ? (
        <p className="text-gray-300 text-center">
          Your cart is empty
        </p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ===== CART ITEMS ===== */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map(item => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex gap-5">

                  {/* Image */}
                  <div className="w-24 h-24 rounded-xl bg-white/10 flex items-center justify-center text-xs text-gray-400">
                    Image
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {item.name}
                    </h3>
                    <p className="text-cyan-300 font-bold mt-1">
                      ₹{item.price}
                    </p>

                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center bg-white/10 rounded-lg">
                        <IconButton onClick={() => handleDecrease(item)}>
                          <Remove sx={{ color: "white" }} />
                        </IconButton>

                        <span className="px-2">
                          {item.quantity}
                        </span>

                        <IconButton onClick={() => handleIncrease(item)}>
                          <Add sx={{ color: "white" }} />
                        </IconButton>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="font-semibold">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ===== SUMMARY ===== */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-2xl bg-white/10 border border-white/20 p-6">
              <h2 className="text-xl font-bold mb-6">
                Order Summary
              </h2>

              <Row label="Subtotal" value={`₹${subtotal}`} />
              <Row label="Delivery" value="Free" />
              <hr className="my-4 border-white/10" />
              <Row
                label="Total"
                value={`₹${total}`}
                bold
              />

              <button
                onClick={() => setShowAddress(true)}
                className="w-full mt-6 py-3 rounded-xl bg-cyan-400 text-black font-semibold"
              >
                Continue to Address
              </button>

              {/* TRUST */}
              <p className="text-xs text-gray-300 mt-4 text-center">
                🔒 Secure UPI • Fast Delivery • Easy Returns
              </p>
            </div>
          </div>

        </div>
      )}

      {/* MODALS */}
      {showAddress && (
        <AddressModal
          onSubmit={handleAddressSubmit}
          onClose={() => setShowAddress(false)}
        />
      )}

      {showUpi && orderInfo && (
        <UpiPaymentModal
          amount={orderInfo.amount}
          orderId={orderInfo.orderId}
          onSubmit={async (txnId) => {
            try {
              await submitPayment(orderInfo.orderId, txnId);
              successToast("Payment submitted");
              setShowUpi(false);
              setCart([]);
            } catch {
              errorToast("Payment failed");
            }
          }}
          onClose={() => setShowUpi(false)}
        />
      )}
    </div>
  );
}

/* ===== SMALL UI PARTS ===== */
const Step = ({ label, active }) => (
  <div className={`px-4 py-1.5 rounded-full text-xs 
    ${active ? "bg-cyan-400 text-black" : "bg-white/10"}`}>
    {label}
  </div>
);

const Line = () => (
  <div className="flex-1 h-px bg-white/10" />
);

const Row = ({ label, value, bold }) => (
  <div className={`flex justify-between mb-3 ${bold && "font-bold"}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

export default Cart;
