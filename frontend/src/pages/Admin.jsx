import { useEffect, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { successToast, errorToast } from "../utils/toast";
import { Printer, Trash2, Plus, BarChart2, Edit2, ChevronDown } from "lucide-react";
import { printReceipt } from "../utils/printReceipt";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';


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

  const [tab, setTab] = useState("analytics"); // "analytics" | "orders" | "products"

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    image: "",
    category: "",
    stock: 10,
  });

  const [visibleOrdersCount, setVisibleOrdersCount] = useState(10);
  const [visibleProductsCount, setVisibleProductsCount] = useState(12);

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
      <div className="text-center text-[#1d1d1f] mt-24 font-medium">
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

  /* ================= STATS & CHART DATA ================= */
  const totalRevenue = orders.reduce(
    (sum, o) => sum + o.totalAmount,
    0
  );

  const pendingPayments = orders.filter(
    (o) => o.status === "PAYMENT_PENDING"
  ).length;

  // Chart 1: Revenue Over Time (Grouped by date)
  const revenueByDate = {};
  orders.forEach(o => {
    const dStr = formatOrderDate(o).split(",")[0]; // Get just the date part
    if (dStr !== "N/A") {
      revenueByDate[dStr] = (revenueByDate[dStr] || 0) + o.totalAmount;
    }
  });
  
  const revenueData = Object.keys(revenueByDate).map(date => ({
    date,
    revenue: revenueByDate[date]
  })).sort((a,b) => new Date(a.date) - new Date(b.date));

  // If we only have 1 data point or 0, let's inject a fake 0 baseline so the chart looks nice
  if (revenueData.length === 1) {
    revenueData.unshift({ date: "Previous", revenue: 0 });
  }

  // Chart 2: Order Status Distribution
  const statusCounts = {};
  orders.forEach(o => {
    const s = o.status.replace("_", " ");
    statusCounts[s] = (statusCounts[s] || 0) + 1;
  });
  const statusData = Object.keys(statusCounts).map(status => ({
    name: status,
    value: statusCounts[status]
  }));
  const PIE_COLORS = ['#0071e3', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444'];

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

  const saveProduct = () => {
    const payload = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock || 0),
    };

    if (editingId) {
      api
        .put(`/products/${editingId}?email=${user.email}`, payload)
        .then(() => {
          setProducts((prev) =>
            prev.map((p) => (p.id === editingId ? { id: editingId, ...payload } : p))
          );
          successToast("Product updated successfully");
          setEditingId(null);
          setProductForm({ name: "", price: "", image: "", category: "", stock: 10 });
        })
        .catch(() => errorToast("Failed to update product"));
    } else {
      api
        .post(`/products?email=${user.email}`, payload)
        .then((res) => {
          setProducts((prev) => [
            ...prev,
            { id: res.data.id, ...payload },
          ]);
          successToast("Product added successfully");
          setProductForm({ name: "", price: "", image: "", category: "", stock: 10 });
        })
        .catch(() => errorToast("Failed to add product"));
    }
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
    <div className="w-full bg-[#f5f5f7] min-h-[calc(100vh-64px)] pb-32 pt-10">
      <div className="max-w-7xl mx-auto px-6">
        <h1 className="text-4xl font-bold tracking-tight text-[#1d1d1f] mb-8 text-center">
          Admin Dashboard
        </h1>

        {/* TABS */}
        <div className="flex justify-center gap-2 mb-10">
          {["analytics", "orders", "products"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-full text-[14px] font-semibold transition-all flex items-center gap-2
                ${
                  tab === t
                    ? "bg-[#1d1d1f] text-white shadow-md"
                    : "bg-white text-[#86868b] hover:text-[#1d1d1f] border border-[rgba(0,0,0,0.06)]"
                }`}
            >
              {t === "analytics" && <BarChart2 size={16} />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ================= ANALYTICS ================= */}
        {tab === "analytics" && (
          <div className="animate-fade-in space-y-8">
            
            {/* STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Stat label="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} />
              <Stat label="Pending Payments" value={pendingPayments} />
              <Stat label="Total Orders" value={orders.length} />
            </div>

            {/* CHARTS ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* REVENUE CHART */}
              <div className="lg:col-span-2 premium-card bg-white p-8">
                <h3 className="text-xl font-bold text-[#1d1d1f] mb-6">Revenue Trend</h3>
                <div className="w-full h-[300px]">
                  {revenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0071e3" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0071e3" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#86868b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#86868b', fontSize: 12}} tickFormatter={(value) => `₹${value}`} />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                          itemStyle={{ color: '#1d1d1f', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#0071e3" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#86868b]">No revenue data yet</div>
                  )}
                </div>
              </div>

              {/* STATUS PIE CHART */}
              <div className="premium-card bg-white p-8">
                <h3 className="text-xl font-bold text-[#1d1d1f] mb-6">Order Status</h3>
                <div className="w-full h-[300px]">
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                          itemStyle={{ color: '#1d1d1f', fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#86868b]">No orders yet</div>
                  )}
                </div>
                {/* Custom Legend */}
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  {statusData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-[12px] text-[#86868b]">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></div>
                      {entry.name}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ================= ORDERS ================= */}
        {tab === "orders" && (
          <div className="animate-fade-in space-y-8">

            {/* SEARCH */}
            <div className="relative">
              <input
                placeholder="Search order ID, UPI, or customer name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-4 rounded-2xl bg-white border border-[rgba(0,0,0,0.08)] text-[#1d1d1f] text-[15px] placeholder:text-[#86868b] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.02)]"
              />
            </div>

            {/* FILTER */}
            <div className="flex flex-wrap gap-2">
              {["ALL", ...ALL_STATUSES].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors border
                    ${
                      statusFilter === s
                        ? "bg-[#0071e3] text-white border-[#0071e3]"
                        : "bg-white text-[#86868b] border-[rgba(0,0,0,0.06)] hover:border-[rgba(0,0,0,0.15)] hover:text-[#1d1d1f]"
                    }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>

            {/* ORDER LIST */}
            <div className="space-y-5">
              {filteredOrders.length === 0 ? (
                <div className="premium-card bg-white p-16 flex flex-col items-center justify-center text-center text-[#86868b]">
                  No orders found matching your criteria.
                </div>
              ) : (
                <>
                  {filteredOrders.slice(0, visibleOrdersCount).map((order) => (
                    <div key={order.id} className="premium-card bg-white p-6 md:p-8 flex flex-col md:flex-row gap-6 justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between md:justify-start md:gap-4">
                          <div>
                            <p className="text-[12px] font-medium text-[#86868b] uppercase tracking-wider mb-1">Order ID</p>
                            <p className="font-mono text-[14px] text-[#1d1d1f] font-semibold break-all">{order.id}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase self-start md:hidden ${STATUS_STYLES[order.status]}`}>
                            {order.status.replace("_", " ")}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div>
                            <p className="text-[12px] text-[#86868b] font-medium">Customer</p>
                            <p className="text-[14px] text-[#1d1d1f]">{order.address?.name || "N/A"}</p>
                          </div>
                          <div>
                            <p className="text-[12px] text-[#86868b] font-medium">UPI Txn</p>
                            <p className="text-[14px] text-[#1d1d1f]">{order.paymentTxnId || "N/A"}</p>
                          </div>
                        </div>

                        <div>
                          <p className="text-[20px] font-bold text-[#1d1d1f] mt-2">
                            ₹{order.totalAmount}
                          </p>
                          <p className="text-[13px] text-[#86868b] font-medium">
                            {formatOrderDate(order)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:items-end justify-between gap-4 border-t border-[rgba(0,0,0,0.06)] md:border-t-0 md:border-l md:pl-6 pt-4 md:pt-0">
                        <span className={`hidden md:inline-block px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${STATUS_STYLES[order.status]}`}>
                          {order.status.replace("_", " ")}
                        </span>
                        
                        <div className="flex flex-col gap-2 w-full md:w-auto">
                          <p className="text-[12px] text-[#86868b] font-medium mb-1 md:text-right">Update Status</p>
                          <div className="flex flex-wrap gap-2 md:justify-end">
                            {ALL_STATUSES.map((s) => (
                              <button
                                key={s}
                                onClick={() => updateStatus(order.id, s)}
                                className="px-3 py-1.5 text-[12px] font-semibold rounded-lg bg-[#f5f5f7] text-[#86868b] hover:bg-[#1d1d1f] hover:text-white transition-colors"
                              >
                                {s.replace("_", " ")}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => printReceipt(order)}
                            className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-xl bg-[#0071e3] text-white hover:bg-[#0060c0] transition-colors"
                          >
                            <Printer size={16} /> Print Receipt
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {visibleOrdersCount < filteredOrders.length && (
                    <div className="flex justify-center mt-6">
                      <button
                        onClick={() => setVisibleOrdersCount(prev => prev + 10)}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-[rgba(0,0,0,0.08)] text-[#1d1d1f] font-medium text-[14px] hover:bg-[#f5f5f7] transition-all"
                      >
                        Load More <ChevronDown size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ================= PRODUCTS ================= */}
        {tab === "products" && (
          <div className="animate-fade-in space-y-10">

            {/* ADD PRODUCT */}
            <div className="premium-card bg-white p-8 md:p-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[#1d1d1f] tracking-tight">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h2>
                {editingId && (
                  <button 
                    onClick={() => { setEditingId(null); setProductForm({ name: "", price: "", image: "", category: "", stock: 10 }); }}
                    className="text-[13px] text-[#0071e3] font-semibold hover:underline"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {["name", "price", "image", "category", "stock"].map((f) => (
                  <div key={f} className={f === "name" || f === "image" ? "md:col-span-2 lg:col-span-1" : ""}>
                    <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2 uppercase tracking-wide">
                      {f}
                    </label>
                    <input
                      placeholder={`Enter ${f}...`}
                      type={f === "price" || f === "stock" ? "number" : "text"}
                      className="w-full p-3.5 rounded-xl bg-[#fbfbfd] border border-[rgba(0,0,0,0.08)] text-[#1d1d1f] text-[15px] focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3] transition-all"
                      value={productForm[f]}
                      onChange={(e) =>
                        setProductForm({ ...productForm, [f]: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>

              <button onClick={saveProduct} className="primary-btn mt-8 flex gap-2 items-center text-[15px]">
                {editingId ? <Edit2 size={18} /> : <Plus size={18} />} 
                {editingId ? "Save Changes" : "Publish Product"}
              </button>
            </div>

            {/* PRODUCT LIST */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, visibleProductsCount).map((p) => (
                <div key={p.id} className="premium-card bg-white p-6 flex flex-col group">
                  <div className="w-full h-48 bg-[#fbfbfd] rounded-2xl p-4 flex items-center justify-center mb-6 isolate relative">
                    <img
                      src={p.image}
                      alt={p.name}
                      decoding="async"
                      className="max-h-full w-full object-contain mix-blend-multiply transform-gpu will-change-transform transition-transform duration-500 group-hover:scale-105"
                    />
                    {(p.stock === undefined || p.stock <= 0) && (
                      <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
                        Sold Out
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-[#1d1d1f] text-[15px] line-clamp-2 leading-tight flex-1">
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[rgba(0,0,0,0.04)]">
                    <div>
                      <p className="text-[16px] font-bold text-[#1d1d1f]">₹{p.price}</p>
                      <p className="text-[12px] font-medium text-[#86868b]">Stock: {p.stock ?? "N/A"}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingId(p.id);
                          setProductForm({
                            name: p.name,
                            price: p.price,
                            image: p.image,
                            category: p.category || "",
                            stock: p.stock ?? 10
                          });
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-2 rounded-full text-[#0071e3] hover:bg-[rgba(0,113,227,0.1)] transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-2 rounded-full text-[#86868b] hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {visibleProductsCount < products.length && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setVisibleProductsCount(prev => prev + 12)}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-[rgba(0,0,0,0.08)] text-[#1d1d1f] font-medium text-[14px] hover:bg-[#f5f5f7] transition-all"
                >
                  Load More <ChevronDown size={16} />
                </button>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

/* ================= STAT CARD ================= */
function Stat({ label, value }) {
  return (
    <div className="premium-card bg-white p-6 md:p-8 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <p className="text-[13px] font-medium text-[#86868b] uppercase tracking-wider mb-2">{label}</p>
      <p className="text-4xl font-bold text-[#1d1d1f] tracking-tight">
        {value}
      </p>
    </div>
  );
}

export default Admin;
