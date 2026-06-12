import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  ShoppingCart,
  Package,
  User,
  LogOut,
  Bell,
  Shield,
  Search,
  X
} from "lucide-react";
import { getCart } from "../services/cartService";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [cartCount, setCartCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAdmin = user?.email === "admin@mystore.com";

  // Functional Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Order Placed successfully", time: "10 mins ago", unread: true, link: "/orders" },
    { id: 2, title: "Your profile was updated", time: "2 hours ago", unread: false, link: "/profile" },
    { id: 3, title: "Welcome to Sojan's Store!", time: "1 day ago", unread: false, link: "/" },
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  const handleNotificationClick = (link, id) => {
    // Mark this specific one as read
    setNotifications(notifications.map(n => n.id === id ? { ...n, unread: false } : n));
    setShowNotifications(false);
    navigate(link);
  };

  /* ================= FETCH CART COUNT ================= */
  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }

    // Initial load
    getCart().then(res => setCartCount(res.data?.length || 0)).catch(console.error);

    // Listen to blazing-fast optimistic updates
    const handleCartUpdate = (e) => {
      if (e.detail !== undefined) {
        setCartCount(e.detail);
      } else {
        // Fallback
        getCart().then(res => setCartCount(res.data?.length || 0));
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [user]);

  /* ================= OUTSIDE CLICK FOR DROPDOWN ================= */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  const activeClass = (path) =>
    isActive(path)
      ? "text-[#0071e3] font-medium"
      : "text-[#86868b] hover:text-[#1d1d1f]";

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[rgba(245,245,247,0.8)] backdrop-blur-md border-b border-[rgba(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* LOGO */}
          <Link to="/" className="text-[#1d1d1f] font-bold tracking-tight text-lg flex items-center gap-2">
            <div className="w-6 h-6 bg-[#1d1d1f] rounded-md flex items-center justify-center">
              <span className="text-white text-xs">S</span>
            </div>
            Sojan's
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8 text-[14px]">
            <DesktopItem to="/" label="Home" active={activeClass("/")} />
            
            {user && (
              <DesktopItem to="/orders" label="Orders" active={activeClass("/orders")} />
            )}

            {isAdmin && (
              <DesktopItem to="/admin" label="Admin" active="text-yellow-600 font-medium" />
            )}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-5 text-[#86868b]">
            {!user ? (
              <div className="hidden md:flex items-center gap-4 text-[14px]">
                <Link to="/login" className={activeClass("/login")}>Login</Link>
                <Link to="/register" className="primary-btn !py-1.5 !px-4 !text-xs !font-medium">Sign Up</Link>
              </div>
            ) : (
              <div className="flex items-center gap-4 md:gap-5">
                
                {/* SEARCH ICON */}
                <div className="relative flex items-center group">
                  <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="flex items-center hover:text-[#1d1d1f] transition-colors"
                  >
                    <Search size={18} />
                  </button>
                  <div className="hidden md:block absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#1d1d1f] text-white text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[60]">
                    Search
                  </div>
                </div>

                {/* NOTIFICATIONS (VISIBLE ON MOBILE) */}
                <div className="relative flex items-center group" ref={dropdownRef}>
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`relative flex items-center hover:text-[#1d1d1f] transition-colors ${showNotifications ? 'text-[#1d1d1f]' : ''}`}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {/* TOOLTIP */}
                  <div className="hidden md:block absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#1d1d1f] text-white text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[60]">
                    Notifications
                  </div>

                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-3 w-72 max-w-[90vw] bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-[rgba(0,0,0,0.04)] overflow-hidden animate-fade-in z-50">
                      <div className="px-4 py-3 border-b border-[rgba(0,0,0,0.04)] bg-[#fbfbfd]">
                        <h3 className="text-[13px] font-bold text-[#1d1d1f]">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map(n => (
                          <div 
                            key={n.id} 
                            onClick={() => handleNotificationClick(n.link, n.id)}
                            className={`px-4 py-3 border-b border-[rgba(0,0,0,0.02)] hover:bg-[#f5f5f7] transition-colors cursor-pointer ${n.unread ? 'bg-[rgba(0,113,227,0.03)]' : ''}`}
                          >
                            <p className={`text-[13px] leading-tight ${n.unread ? 'font-semibold text-[#1d1d1f]' : 'text-[#86868b]'}`}>{n.title}</p>
                            <p className="text-[11px] text-[#86868b] mt-1">{n.time}</p>
                          </div>
                        ))}
                      </div>
                      <div className="px-4 py-2 bg-[#fbfbfd] text-center">
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-[12px] text-[#0071e3] font-medium hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* PROFILE (HIDDEN ON MOBILE) */}
                <div className="hidden md:flex relative items-center group">
                  <Link to="/profile" className={`flex items-center hover:text-[#1d1d1f] transition-colors ${isActive('/profile') ? 'text-[#0071e3]' : ''}`}>
                    <User size={18} />
                  </Link>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#1d1d1f] text-white text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[60]">
                    Profile
                  </div>
                </div>

                {/* LOGOUT (HIDDEN ON MOBILE) */}
                <div className="hidden md:flex relative items-center group">
                  <button onClick={logout} className="flex items-center hover:text-red-500 transition-colors">
                    <LogOut size={18} />
                  </button>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#1d1d1f] text-white text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[60]">
                    Logout
                  </div>
                </div>
              </div>
            )}

            {/* CART (HIDDEN ON MOBILE) */}
            <div className="hidden md:flex relative items-center group">
              <Link to="/cart" className={`relative flex items-center hover:text-[#1d1d1f] transition-colors ${isActive('/cart') ? 'text-[#0071e3]' : ''}`}>
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-[#0071e3] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <div className="absolute top-full mt-2 right-0 px-2.5 py-1 bg-[#1d1d1f] text-white text-[11px] font-medium rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[60]">
                Cart
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FULL SCREEN SEARCH OVERLAY */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] bg-[rgba(245,245,247,0.8)] backdrop-blur-xl animate-fade-in flex flex-col items-center pt-20 px-6">
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white border border-[rgba(0,0,0,0.06)] hover:bg-[#f5f5f7] transition-all"
          >
            <X size={20} className="text-[#1d1d1f]" />
          </button>
          
          <div className="w-full max-w-2xl relative">
            <Search size={24} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#86868b]" />
            <input 
              autoFocus
              placeholder="Search products, categories, or brands..." 
              className="w-full bg-white rounded-3xl py-6 pl-16 pr-6 text-2xl font-bold text-[#1d1d1f] placeholder:text-[rgba(0,0,0,0.2)] placeholder:font-semibold shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[rgba(0,0,0,0.04)] focus:outline-none focus:ring-4 focus:ring-[rgba(0,113,227,0.1)] transition-all"
            />
          </div>
          
          <div className="mt-12 w-full max-w-2xl text-left">
            <h4 className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-4">Quick Links</h4>
            <div className="flex flex-wrap gap-2">
              {['Headphones', 'Smart Watches', 'Accessories', 'Pro Audio'].map(t => (
                <button key={t} className="px-4 py-2 bg-white rounded-full text-[14px] font-medium text-[#1d1d1f] border border-[rgba(0,0,0,0.04)] hover:border-[#0071e3] transition-all">
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAV */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-[rgba(245,245,247,0.95)] backdrop-blur-md border-t border-[rgba(0,0,0,0.06)] pb-safe z-50">
        <div className="flex items-center justify-around px-4 py-3">
          <MobileItem to="/" icon={<Home size={20} />} label="Home" active={activeClass("/")} />
          
          <Link to="/cart" className={`flex flex-col items-center gap-1 transition-colors ${activeClass("/cart")} relative`}>
            <div className="relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#0071e3] text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Cart</span>
          </Link>
          
          {user ? (
            <>
              {isAdmin && (
                <MobileItem to="/admin" icon={<Shield size={20} />} label="Admin" active={activeClass("/admin")} />
              )}
              <MobileItem to="/orders" icon={<Package size={20} />} label="Orders" active={activeClass("/orders")} />
              <MobileItem to="/profile" icon={<User size={20} />} label="Profile" active={activeClass("/profile")} />
            </>
          ) : (
            <MobileItem to="/login" icon={<User size={20} />} label="Login" active={activeClass("/login")} />
          )}
        </div>
      </div>
    </>
  );
}

/* ================= MOBILE ITEM ================= */
function MobileItem({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center gap-1 transition-colors ${active}`}
    >
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

/* ================= DESKTOP ITEM ================= */
function DesktopItem({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`transition-colors ${active}`}
    >
      {label}
    </Link>
  );
}

export default Navbar;
