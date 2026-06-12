import { useEffect, useState } from "react";
import { getOrders } from "../services/orderService";
import OrderStatus from "../components/OrderStatus";
import { infoToast, errorToast } from "../utils/toast";
import { useAuth } from "../context/AuthContext";

const formatOrderDate = (order) => {
  const date =
    order.paymentSubmittedAt ||
    order.createdAt ||
    order.updatedAt;

  if (!date) return "N/A";

  // 🔥 Firestore Timestamp (Admin SDK)
  if (date._seconds) {
    return new Date(date._seconds * 1000).toLocaleString();
  }

  // 🔥 Firestore Timestamp (Client SDK)
  if (date.seconds) {
    return new Date(date.seconds * 1000).toLocaleString();
  }

  // 🔥 JS Date or ISO string
  const d = new Date(date);
  return isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
};

function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    getOrders()
      .then(res => {
        setOrders(res.data);
        if (res.data.length === 0) {
          infoToast("You have no orders yet");
        }
      })
      .catch(() => errorToast("Failed to load orders"))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="w-full bg-[#f5f5f7] min-h-[calc(100vh-64px)] flex items-center justify-center text-[#1d1d1f]">
        Please login to view your orders
      </div>
    );
  }

  return (
    <div className="w-full bg-[#f5f5f7] min-h-[calc(100vh-64px)] pt-12 pb-32 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f] mb-2">
            My Orders
          </h1>
          <p className="text-[15px] text-[#86868b]">
            Track your recent purchases and deliveries
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="premium-card bg-white p-16 flex flex-col items-center justify-center text-center animate-fade-in">
            <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-2">You haven't placed any orders yet.</h2>
            <p className="text-[#86868b] mb-8">When you do, they will show up here for you to track.</p>
            <a href="/" className="outline-btn">Start Shopping</a>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map(order => (
              <div
                key={order.id}
                className="premium-card bg-white p-6 sm:p-8 animate-fade-in"
              >
                {/* TOP ROW */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-6 border-b border-[rgba(0,0,0,0.06)]">
                  <div>
                    <p className="text-[13px] text-[#86868b] mb-0.5">
                      Order placed on
                    </p>
                    <p className="text-[15px] font-medium text-[#1d1d1f]">
                      {formatOrderDate(order)}
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-[13px] text-[#86868b] mb-0.5">
                      Order Total
                    </p>
                    <p className="text-xl font-bold text-[#1d1d1f]">
                      ₹{order.totalAmount}
                    </p>
                  </div>
                </div>

                {/* STATUS MAP */}
                <div className="py-6 border-b border-[rgba(0,0,0,0.06)]">
                  <OrderStatus status={order.status} />
                </div>

                {/* PAYMENT INFO */}
                <div className="py-6 border-b border-[rgba(0,0,0,0.06)]">
                  <p className="text-[13px] text-[#86868b] mb-1">Payment Method</p>
                  <p className="text-[15px] font-medium text-[#1d1d1f]">
                    UPI &middot; {order.paymentTxnId}
                  </p>
                </div>

                {/* ITEMS */}
                <div className="pt-6">
                  <p className="text-[14px] font-medium text-[#1d1d1f] mb-4">
                    Items in this order
                  </p>

                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="
                          flex justify-between items-center
                          px-4 py-3
                          rounded-xl
                          bg-[#fbfbfd] border border-[rgba(0,0,0,0.06)]
                        "
                      >
                        <span className="text-[15px] font-medium text-[#1d1d1f] truncate">
                          {item.name}
                        </span>
                        <span className="text-[#86868b] text-[14px] font-medium whitespace-nowrap ml-4">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FOOTER */}
                <div className="mt-8 pt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-[12px] font-medium text-[#86868b] border-t border-[rgba(0,0,0,0.04)]">
                  <span>
                    Order ID: {order.id}
                  </span>
                  <a href="mailto:support@sojan.store" className="hover:text-[#1d1d1f] transition-colors">
                    Need help? Contact support
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;
