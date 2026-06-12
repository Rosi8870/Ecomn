import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { Plus, Minus, Trash2, Copy, ArrowLeft } from "lucide-react";

import {
  getCart,
  updateQuantity,
  removeFromCart,
  clearLocalCart
} from "../services/cartService";

import { placeOrder, submitPayment } from "../services/orderService";
import { useAuth } from "../context/AuthContext";
import { successToast, errorToast } from "../utils/toast";
import { STORE_UPI_ID, STORE_NAME } from "../config/upi";
import { db } from "../firebase";

function Cart() {
  const { user } = useAuth();

  const [cart, setCart] = useState([]);
  const [profile, setProfile] = useState(null);

  const [checkoutStep, setCheckoutStep] = useState("cart"); // "cart" | "address" | "payment"
  const [orderInfo, setOrderInfo] = useState(null);
  const [txnId, setTxnId] = useState("");

  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const [loading, setLoading] = useState(true);

  /* ================= LOAD CART + PROFILE ================= */
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const [cartRes, profileSnap] = await Promise.all([
          getCart(),
          getDoc(doc(db, "users", user.uid)),
        ]);

        setCart(cartRes.data);

        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        }
      } catch {
        errorToast("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  /* ================= GUARDS ================= */
  if (!user) {
    return (
      <div className="w-full bg-[#f5f5f7] min-h-[calc(100vh-64px)] flex items-center justify-center text-[#1d1d1f]">
        Please login to view your cart
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full bg-[#f5f5f7] min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ================= TOTALS ================= */
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  
  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === "WELCOME10") {
      setDiscount(subtotal * 0.1);
      successToast("Promo code applied! 10% off.");
    } else {
      errorToast("Invalid promo code");
      setDiscount(0);
    }
  };

  const total = subtotal - discount;

  /* ================= ACTIONS ================= */
  const handleIncrease = async (item) => {
    try {
      await updateQuantity(item.id, item.quantity + 1);
      setCart(prev =>
        prev.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      );
    } catch {
      errorToast("Failed to update quantity");
    }
  };

  const handleDecrease = async (item) => {
    try {
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
    } catch {
      errorToast("Failed to update cart");
    }
  };

  const handleRemove = async (id) => {
    try {
      await removeFromCart(id);
      setCart(prev => prev.filter(i => i.id !== id));
      successToast("Item removed");
    } catch {
      errorToast("Failed to remove item");
    }
  };

  /* ================= PLACE ORDER ================= */
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    const address = {
      name: e.target.name.value.trim(),
      address: e.target.address.value.trim(),
      city: e.target.city.value.trim(),
      pincode: e.target.pincode.value.trim(),
    };

    if (!address.name || !address.address || !address.city || !address.pincode) {
      errorToast("Please fill all delivery details");
      return;
    }

    try {
      const transactionId = `UPI_${Date.now()}`;
      const res = await placeOrder(
        cart,
        total,
        transactionId,
        address,
        user.uid
      );

      setOrderInfo({
        orderId: res.data.orderId,
        amount: total,
      });

      setCheckoutStep("payment");
    } catch {
      errorToast("Order failed");
    }
  };

  const handlePaymentSubmit = async () => {
    if (!txnId.trim()) {
      errorToast("Please enter the UPI Transaction ID");
      return;
    }
    
    try {
      await submitPayment(orderInfo.orderId, txnId);
      successToast("Payment submitted successfully 🎉");
      setCheckoutStep("cart");
      setCart([]);
      clearLocalCart();
    } catch {
      errorToast("Payment verification failed");
    }
  };

  const copyUpi = async () => {
    await navigator.clipboard.writeText(STORE_UPI_ID);
    successToast("UPI ID copied");
  };

  const isLocked = profile?.address && profile?.city && profile?.pincode && profile?.name;
  const upiLink = orderInfo ? `upi://pay?pa=${STORE_UPI_ID}&pn=${STORE_NAME}&am=${orderInfo.amount}&cu=INR` : "#";

  /* ================= UI ================= */
  return (
    <div className="w-full bg-[#f5f5f7] min-h-[calc(100vh-64px)] py-12">
      <div className="max-w-6xl mx-auto px-6">

        {/* HEADER */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f] mb-2">Checkout</h1>
            <p className="text-[#86868b] text-[15px]">
              {cart.length} {cart.length === 1 ? 'item' : 'items'} in your bag
            </p>
          </div>
          
          {checkoutStep !== "cart" && (
            <button
              onClick={() => setCheckoutStep("cart")}
              className="flex items-center gap-2 text-[#86868b] hover:text-[#1d1d1f] transition-colors text-[14px] font-medium"
            >
              <ArrowLeft size={16} /> Back to Cart
            </button>
          )}
        </div>

        {/* STEPS */}
        <div className="flex items-center gap-4 mb-10 text-[13px] font-medium uppercase tracking-wider">
          <Step active={checkoutStep === "cart" || checkoutStep === "address" || checkoutStep === "payment"} label="1. Cart" />
          <Line />
          <Step active={checkoutStep === "address" || checkoutStep === "payment"} label="2. Address" />
          <Line />
          <Step active={checkoutStep === "payment"} label="3. Payment" />
        </div>

        {cart.length === 0 ? (
          <div className="premium-card bg-white p-16 flex flex-col items-center justify-center text-center animate-fade-in">
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2">Your bag is empty.</h2>
            <p className="text-[#86868b] mb-8">Sign in to see if you have any saved items or continue shopping.</p>
            <a href="/" className="outline-btn">Continue Shopping</a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">

            {/* MAIN CONTENT AREA */}
            <div className="lg:col-span-2 relative">
              
              {/* STEP 1: CART ITEMS */}
              {checkoutStep === "cart" && (
                <div className="space-y-6 animate-fade-in">
                  {cart.map(item => (
                    <div key={item.id} className="premium-card bg-white p-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                      <div className="w-32 h-32 rounded-2xl bg-[#fbfbfd] p-4 flex items-center justify-center shrink-0 isolate">
                        {item.image ? (
                          <img src={item.image} alt={item.name} decoding="async" className="w-full h-full object-contain mix-blend-multiply transform-gpu will-change-transform" />
                        ) : (
                          <span className="text-xs text-[#86868b]">No Image</span>
                        )}
                      </div>
                      <div className="flex-1 w-full flex flex-col justify-between h-full">
                        <div className="flex justify-between items-start mb-4 sm:mb-0">
                          <div>
                            <h3 className="font-semibold text-lg text-[#1d1d1f] leading-tight">{item.name}</h3>
                            <p className="text-[15px] font-medium text-[#86868b] mt-1">₹{item.price}</p>
                          </div>
                          <div className="font-semibold text-lg text-[#1d1d1f]">₹{item.price * item.quantity}</div>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-4 sm:pt-0">
                          <div className="flex items-center bg-[#fbfbfd] border border-[rgba(0,0,0,0.06)] rounded-full h-10 px-1">
                            <button onClick={() => handleDecrease(item)} className="w-8 h-8 flex items-center justify-center rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"><Minus size={14} /></button>
                            <span className="w-8 text-center text-[14px] font-medium text-[#1d1d1f]">{item.quantity}</span>
                            <button onClick={() => handleIncrease(item)} className="w-8 h-8 flex items-center justify-center rounded-full text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors"><Plus size={14} /></button>
                          </div>
                          <button onClick={() => handleRemove(item.id)} className="text-[#86868b] hover:text-red-500 transition-colors flex items-center gap-1 text-[13px] font-medium"><Trash2 size={16} /> Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* STEP 2: ADDRESS FORM */}
              {checkoutStep === "address" && (
                <div className="premium-card bg-white p-8 sm:p-10 animate-fade-in">
                  <div className="mb-8 pr-8">
                    <h2 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">Delivery Address</h2>
                    <p className="text-[15px] text-[#86868b] mt-2">
                      {isLocked ? "Using your saved delivery address" : "Enter the address where you want your order delivered"}
                    </p>
                  </div>
                  <form id="address-form" onSubmit={handleAddressSubmit} className="space-y-4">
                    <InputField name="name" label="Full Name" defaultValue={profile?.name || ""} disabled={isLocked} />
                    <TextAreaField name="address" label="Full Address" defaultValue={profile?.address || ""} disabled={isLocked} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <InputField name="city" label="City" defaultValue={profile?.city || ""} disabled={isLocked} />
                      <InputField name="pincode" label="Pincode" defaultValue={profile?.pincode || ""} disabled={isLocked} />
                    </div>
                    {isLocked && <p className="text-[13px] text-[#86868b] mt-4 font-medium">To change address, update it from your Profile page</p>}
                  </form>
                </div>
              )}

              {/* STEP 3: PAYMENT FORM */}
              {checkoutStep === "payment" && (
                <div className="premium-card bg-white p-8 sm:p-10 animate-fade-in">
                  <div className="mb-8 pr-8">
                    <h2 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">Complete Payment</h2>
                    <p className="text-[15px] text-[#86868b] mt-2">Pay securely using UPI</p>
                  </div>
                  <div className="mb-8 rounded-2xl bg-[#fbfbfd] border border-[rgba(0,0,0,0.06)] p-6 flex flex-col items-center justify-center text-center">
                    <p className="text-[14px] text-[#86868b] font-medium mb-1">Amount to Pay</p>
                    <p className="text-4xl font-bold text-[#1d1d1f] tracking-tight">₹{orderInfo?.amount}</p>
                  </div>
                  <div className="mb-6">
                    <p className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">Pay to UPI ID</p>
                    <div className="flex items-center justify-between rounded-xl bg-[#fbfbfd] border border-[rgba(0,0,0,0.08)] px-4 py-3">
                      <span className="font-mono text-[15px] text-[#1d1d1f]">{STORE_UPI_ID}</span>
                      <button onClick={copyUpi} className="text-[#86868b] hover:text-[#0071e3] transition-colors"><Copy size={18} /></button>
                    </div>
                  </div>
                  <a href={upiLink} className="w-full outline-btn flex items-center justify-center mb-8 h-12">Open UPI App</a>
                  <div className="h-px bg-[rgba(0,0,0,0.06)] w-full mb-8" />
                  <div className="mb-2">
                    <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">UPI Transaction ID</label>
                    <input value={txnId} onChange={(e) => setTxnId(e.target.value)} placeholder="Paste 12-digit transaction ID here" className="w-full rounded-xl bg-[#fbfbfd] border border-[rgba(0,0,0,0.08)] px-4 py-3 text-[#1d1d1f] text-[15px] placeholder:text-[#86868b] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all" />
                    <p className="text-[12px] text-[#86868b] mt-2 font-medium">This is required to manually verify your payment.</p>
                  </div>
                </div>
              )}

            </div>

            {/* SUMMARY (ALWAYS STICKY ON RIGHT) */}
            <div className="lg:sticky lg:top-24">
              <div className="premium-card bg-white p-8">
                <h2 className="text-2xl font-bold tracking-tight text-[#1d1d1f] mb-8">Summary</h2>
                
                {/* PROMO CODE */}
                {checkoutStep === "cart" && (
                  <div className="mb-6 pb-6 border-b border-[rgba(0,0,0,0.06)]">
                    <p className="text-[13px] font-medium text-[#1d1d1f] mb-2">Promo Code</p>
                    <div className="flex gap-2">
                      <input 
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="WELCOME10" 
                        className="w-full rounded-lg bg-[#fbfbfd] border border-[rgba(0,0,0,0.08)] px-3 py-2 text-[14px] uppercase focus:outline-none focus:border-[#0071e3] transition-colors"
                      />
                      <button onClick={handleApplyPromo} className="bg-[#1d1d1f] text-white px-4 rounded-lg text-[13px] font-medium hover:bg-[#000] transition-colors">
                        Apply
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4 text-[15px]">
                  <Row label="Subtotal" value={`₹${subtotal}`} />
                  {discount > 0 && <Row label="Discount" value={`-₹${discount}`} className="text-green-600 font-medium" />}
                  <Row label="Estimated Delivery" value="Free" />
                  <div className="h-px bg-[rgba(0,0,0,0.06)] my-6" />
                  <div className="flex justify-between items-center font-bold text-xl text-[#1d1d1f] mb-8">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                {checkoutStep === "cart" && (
                  <button onClick={() => setCheckoutStep("address")} className="w-full primary-btn h-14 text-[16px]">
                    Proceed to Address
                  </button>
                )}
                {checkoutStep === "address" && (
                  <button type="submit" form="address-form" className="w-full primary-btn h-14 text-[16px]">
                    Proceed to Payment
                  </button>
                )}
                {checkoutStep === "payment" && (
                  <button onClick={handlePaymentSubmit} className="w-full primary-btn h-14 text-[16px]">
                    Verify & Place Order
                  </button>
                )}

                <p className="text-[12px] text-[#86868b] mt-6 flex flex-col gap-1 items-center justify-center text-center">
                  <span className="flex items-center gap-1">🔒 Secure Encrypted Checkout</span>
                  Need help? Contact our premium support.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

/* ================= UI PARTS ================= */
const Step = ({ label, active }) => (
  <div className={`transition-colors ${active ? "text-[#1d1d1f]" : "text-[rgba(0,0,0,0.2)]"}`}>
    {label}
  </div>
);

const Line = () => (
  <div className="w-12 h-[2px] bg-[rgba(0,0,0,0.06)] rounded-full" />
);

const Row = ({ label, value, className }) => (
  <div className="flex justify-between text-[#1d1d1f]">
    <span className="text-[#86868b]">{label}</span>
    <span className={className || "font-medium"}>{value}</span>
  </div>
);

function InputField({ label, disabled, ...props }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">{label}</label>
      <input {...props} required disabled={disabled} className={`w-full rounded-xl px-4 py-3 text-[15px] placeholder:text-[#86868b] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all ${disabled ? "bg-[#f5f5f7] border border-[rgba(0,0,0,0.04)] text-[#86868b] cursor-not-allowed" : "bg-[#fbfbfd] border border-[rgba(0,0,0,0.08)] text-[#1d1d1f]"}`} />
    </div>
  );
}

function TextAreaField({ label, disabled, ...props }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">{label}</label>
      <textarea {...props} rows={3} required disabled={disabled} style={{ resize: 'none' }} className={`w-full rounded-xl px-4 py-3 text-[15px] placeholder:text-[#86868b] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all ${disabled ? "bg-[#f5f5f7] border border-[rgba(0,0,0,0.04)] text-[#86868b] cursor-not-allowed" : "bg-[#fbfbfd] border border-[rgba(0,0,0,0.08)] text-[#1d1d1f]"}`} />
    </div>
  );
}

export default Cart;
