import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  ShoppingCart,
  Package,
  User,
  LogOut,
  Shield
} from "lucide-react";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isAdmin = user?.email === "admin@mystore.com";

  const isActive = (path) => location.pathname === path;

  const activeClass = (path) =>
    isActive(path)
      ? "text-cyan-400 nav-active"
      : "text-white/60 hover:text-white";

  return (
    <>
      {/* ================= MOBILE BOTTOM DOCK ================= */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
        <div
          className="
            flex items-center gap-6
            px-6 py-3
            rounded-2xl
            bg-white/10
            backdrop-blur-md
            border border-white/20
            shadow-xl
            text-xs
          "
        >
          <MobileItem to="/" icon={<Home size={20} />} label="Home" active={activeClass("/")} />
          <MobileItem to="/cart" icon={<ShoppingCart size={20} />} label="Cart" active={activeClass("/cart")} />

          {user && (
            <MobileItem
              to="/orders"
              icon={<Package size={20} />}
              label="Orders"
              active={activeClass("/orders")}
            />
          )}

          {user && (
            <MobileItem
              to="/profile"
              icon={<User size={20} />}
              label="Profile"
              active={activeClass("/profile")}
            />
          )}

          {isAdmin && (
            <MobileItem
              to="/admin"
              icon={<Shield size={20} />}
              label="Admin"
              active="text-yellow-400 nav-active"
            />
          )}

          {!user ? (
            <>
              <MobileItem
                to="/login"
                icon={<User size={20} />}
                label="Login"
                active={activeClass("/login")}
              />
              <MobileItem
                to="/register"
                icon={<User size={20} />}
                label="Register"
                active={activeClass("/register")}
              />
            </>
          ) : (
            <button
              onClick={logout}
              className="flex flex-col items-center gap-1 text-white/60 hover:text-white"
            >
              <LogOut size={20} />
              <span className="text-[11px]">Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= DESKTOP FLOATING BAR ================= */}
      <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div
          className="
            flex items-center gap-6
            px-8 py-3
            rounded-full
            bg-white/10
            backdrop-blur-sm
            border border-white/20
            shadow-lg
            text-sm
          "
        >
          <DesktopItem to="/" icon={<Home size={18} />} label="Home" active={activeClass("/")} />
          <DesktopItem to="/cart" icon={<ShoppingCart size={18} />} label="Cart" active={activeClass("/cart")} />

          {user && (
            <DesktopItem
              to="/orders"
              icon={<Package size={18} />}
              label="Orders"
              active={activeClass("/orders")}
            />
          )}

          {user && (
            <DesktopItem
              to="/profile"
              icon={<User size={18} />}
              label="Profile"
              active={activeClass("/profile")}
            />
          )}

          {isAdmin && (
            <DesktopItem
              to="/admin"
              icon={<Shield size={18} />}
              label="Admin"
              active="text-yellow-400 nav-active"
            />
          )}

          {!user ? (
            <>
              <DesktopItem
                to="/login"
                icon={<User size={18} />}
                label="Login"
                active={activeClass("/login")}
              />
              <DesktopItem
                to="/register"
                icon={<User size={18} />}
                label="Register"
                active={activeClass("/register")}
              />
            </>
          ) : (
            <button
              onClick={logout}
              className="flex items-center gap-2 text-white/60 hover:text-white"
            >
              <LogOut size={18} />
              Logout
            </button>
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
      className={`flex flex-col items-center gap-1 transition ${active}`}
    >
      {icon}
      <span className="text-[11px]">{label}</span>
    </Link>
  );
}

/* ================= DESKTOP ITEM ================= */
function DesktopItem({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 transition ${active}`}
    >
      {icon}
      {label}
    </Link>
  );
}

export default Navbar;
