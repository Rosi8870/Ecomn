import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { successToast, errorToast } from "../utils/toast";
import { Printer, Trash2, Plus } from "lucide-react";
import { printReceipt } from "../utils/printReceipt";


/* ================= HELPERS ================= */
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



const STATUS_STYLES = {
  PAYMENT_PENDING: "bg-yellow-500/20 text-yellow-300",
  PAYMENT_SUBMITTED: "bg-blue-500/20 text-blue-300",
  PAID: "bg-green-500/20 text-green-300",
  SHIPPED: "bg-purple-500/20 text-purple-300",
  DELIVERED: "bg-emerald-500/20 text-emerald-300",
};

const ALL_STATUSES = [
  "PAYMENT_PENDING",
  "PAYMENT_SUBMITTED",
  "PAID",
  "SHIPPED",
  "DELIVERED",
];

/* ================= COMPONENT ================= */
function Admin() {
  const { user } = useAuth();

  const [tab, setTab] = useState("orders");

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    if (!user) return;

    api
      .get(`/admin/orders?email=${user.email}`)
      .then((res) => setOrders(res.data))
      .catch(() => errorToast("Failed to load orders"));

    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch(() => errorToast("Failed to load products"));
  }, [user]);

  if (!user || user.email !== "admin@mystore.com") {
    return (
      <div className="text-center text-white mt-24">
        Admin access only
      </div>
    );
  }

  /* ================= FILTERS ================= */
  const filteredOrders = orders.filter((o) => {
    const matchStatus =
      statusFilter === "ALL" || o.status === statusFilter;

    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.paymentTxnId?.toLowerCase().includes(search.toLowerCase()) ||
      o.address?.name?.toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchSearch;
  });

  /* ================= STATS ================= */
  const totalRevenue = orders.reduce(
    (sum, o) => sum + o.totalAmount,
    0
  );

  const pendingPayments = orders.filter(
    (o) => o.status === "PAYMENT_PENDING"
  ).length;

  /* ================= ACTIONS ================= */
  const updateStatus = (orderId, status) => {
    api
      .put(`/admin/orders/${orderId}?email=${user.email}`, { status })
      .then(() => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status } : o
          )
        );
        successToast("Order status updated");
      })
      .catch(() => errorToast("Update failed"));
  };

  const addProduct = () => {
    api
      .post(`/products?email=${user.email}`, {
        ...productForm,
        price: Number(productForm.price),
      })
      .then((res) => {
        setProducts((prev) => [
          ...prev,
          { id: res.data.id, ...productForm },
        ]);
        successToast("Product added");
        setProductForm({
          name: "",
          price: "",
          image: "",
          category: "",
        });
      })
      .catch(() => errorToast("Failed to add product"));
  };

  const deleteProduct = (id) => {
    api
      .delete(`/products/${id}?email=${user.email}`)
      .then(() => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        successToast("Product deleted");
      })
      .catch(() => errorToast("Delete failed"));
  };

  /* ================= UI ================= */
  return (
    <div className="max-w-7xl mx-auto px-4 text-white pb-32">

      <h1 className="text-3xl font-bold my-6 text-center">
        Admin Dashboard
      </h1>

      {/* TABS */}
      <div className="flex justify-center gap-3 mb-8">
        {["orders", "products"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-semibold
              ${
                tab === t
                  ? "bg-cyan-400 text-black"
                  : "bg-white/10 text-white/70"
              }`}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ================= ORDERS ================= */}
      {tab === "orders" && (
        <>
          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Stat label="Total Revenue" value={`₹${totalRevenue}`} />
            <Stat label="Pending Payments" value={pendingPayments} />
            <Stat label="Total Orders" value={orders.length} />
          </div>

          {/* SEARCH */}
          <input
            placeholder="Search order / UPI / name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-4 p-3 rounded-lg bg-white/10 border border-white/20 text-white"
          />

          {/* FILTER */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["ALL", ...ALL_STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold
                  ${
                    statusFilter === s
                      ? "bg-cyan-400 text-black"
                      : "bg-white/10 text-white/70"
                  }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* ORDER LIST */}
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <div key={order.id} className="glass p-5">
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-xs text-gray-300">Order ID</p>
                    <p className="font-mono text-xs break-all">{order.id}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[order.status]}`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                </div>

                <p className="text-sm"><b>Customer:</b> {order.address?.name}</p>
                <p className="text-sm"><b>UPI:</b> {order.paymentTxnId}</p>
                <p className="text-cyan-300 font-bold mt-1">
                  ₹{order.totalAmount}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {formatOrderDate(order)}
                </p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {ALL_STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(order.id, s)}
                      className="px-3 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/20"
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}

                  <button
                       onClick={() => printReceipt(order)}
                       className="px-3 py-1 text-xs rounded-lg bg-cyan-400/20 text-cyan-300 flex items-center gap-1"
                   >
                 <Printer size={14} /> Receipt
                </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= PRODUCTS ================= */}
      {tab === "products" && (
        <div className="space-y-8">

          {/* ADD PRODUCT */}
          <div className="glass p-6">
            <h2 className="text-xl font-bold mb-4">Add Product</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["name", "price", "image", "category"].map((f) => (
                <input
                  key={f}
                  placeholder={f.toUpperCase()}
                  type={f === "price" ? "number" : "text"}
                  className="p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                  value={productForm[f]}
                  onChange={(e) =>
                    setProductForm({ ...productForm, [f]: e.target.value })
                  }
                />
              ))}
            </div>

            <button onClick={addProduct} className="glass-btn mt-4 flex gap-2 items-center">
              <Plus size={16} /> Add Product
            </button>
          </div>

          {/* PRODUCT LIST */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="glass p-4">
                <img
                  src={p.image}
                  alt={p.name}
                  className="h-40 w-full object-cover rounded-xl mb-3"
                />
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-cyan-300 font-bold">₹{p.price}</p>

                <button
                  onClick={() => deleteProduct(p.id)}
                  className="mt-3 px-3 py-1 text-xs rounded-lg bg-red-500/20 text-red-300 flex items-center gap-1"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}

/* ================= STAT CARD ================= */
function Stat({ label, value }) {
  return (
    <div className="glass p-4 text-center">
      <p className="text-sm text-gray-300">{label}</p>
      <p className="text-2xl font-bold text-cyan-300 mt-1">
        {value}
      </p>
    </div>
  );
}

export default Admin;
