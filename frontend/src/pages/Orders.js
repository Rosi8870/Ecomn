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
      <div className="text-center text-white mt-24">
        Please login to view your orders
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-28 text-white">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          My Orders
        </h1>
        <p className="text-gray-300 mt-1">
          Track your recent purchases and deliveries
        </p>
      </div>

      {loading ? (
        <p className="text-center text-gray-300">
          Loading your orders...
        </p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-300">
          You haven’t placed any orders yet
        </p>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div
              key={order.id}
              className="
                rounded-2xl
                border border-white/10
                bg-white/5
                p-5 sm:p-6
              "
            >
              {/* TOP ROW */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <p className="text-xs text-gray-400">
                    Order placed on
                  </p>
                  <p className="text-sm font-medium">
                    {formatOrderDate(order)}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-gray-400">
                    Order Total
                  </p>
                  <p className="text-xl font-bold text-cyan-300">
                    ₹{order.totalAmount}
                  </p>
                </div>
              </div>

              {/* STATUS */}
              <div className="mt-5">
                <OrderStatus status={order.status} />
              </div>

              {/* PAYMENT */}
              <div className="mt-4 text-sm">
                <span className="text-gray-300">
                  Payment:
                </span>{" "}
                <span className="font-medium">
                  UPI · {order.paymentTxnId}
                </span>
              </div>

              {/* ITEMS */}
              <div className="mt-6">
                <p className="text-sm text-gray-300 mb-2">
                  Items in this order
                </p>

                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="
                        flex justify-between items-center
                        px-4 py-2
                        rounded-lg
                        bg-white/10
                        text-sm
                      "
                    >
                      <span className="truncate">
                        {item.name}
                      </span>
                      <span className="text-cyan-300 font-semibold">
                        × {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs text-gray-400">
                <span>
                  Order ID: {order.id}
                </span>
                <span>
                  Need help? Contact support
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;
