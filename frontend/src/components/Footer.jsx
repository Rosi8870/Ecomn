import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

function Footer() {
  return (
    <footer className="w-full bg-white border-t border-[rgba(0,0,0,0.04)] pt-16 pb-8 md:pb-safe-offset-8">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* TOP SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="md:col-span-1">
            <Link to="/" className="text-[#1d1d1f] font-bold tracking-tight text-xl flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-[#1d1d1f] rounded-md flex items-center justify-center shrink-0">
                <span className="text-white text-sm">S</span>
              </div>
              Sojan's
            </Link>
            <p className="text-[#86868b] text-[13px] leading-relaxed mb-6">
              Experience the deepest bass and crystal-clear highs with our next-generation audio technology.
            </p>
            <div className="flex gap-4 text-[#86868b]">
              <a href="#" className="hover:text-[#1d1d1f] transition-colors"><Twitter size={18} /></a>
              <a href="#" className="hover:text-[#1d1d1f] transition-colors"><Facebook size={18} /></a>
              <a href="#" className="hover:text-[#1d1d1f] transition-colors"><Instagram size={18} /></a>
              <a href="#" className="hover:text-[#1d1d1f] transition-colors"><Youtube size={18} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-[#1d1d1f] font-semibold text-[13px] uppercase tracking-wider mb-4">Shop</h4>
            <ul className="space-y-3 text-[14px] text-[#86868b]">
              <li><Link to="/" className="hover:text-[#1d1d1f] hover:underline transition-all">Latest Products</Link></li>
              <li><Link to="/" className="hover:text-[#1d1d1f] hover:underline transition-all">Audio & Headphones</Link></li>
              <li><Link to="/" className="hover:text-[#1d1d1f] hover:underline transition-all">Smart Watches</Link></li>
              <li><Link to="/" className="hover:text-[#1d1d1f] hover:underline transition-all">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#1d1d1f] font-semibold text-[13px] uppercase tracking-wider mb-4">Support</h4>
            <ul className="space-y-3 text-[14px] text-[#86868b]">
              <li><a href="#" className="hover:text-[#1d1d1f] hover:underline transition-all">Track Order</a></li>
              <li><a href="#" className="hover:text-[#1d1d1f] hover:underline transition-all">Returns & Refunds</a></li>
              <li><a href="#" className="hover:text-[#1d1d1f] hover:underline transition-all">Warranty Info</a></li>
              <li><a href="#" className="hover:text-[#1d1d1f] hover:underline transition-all">Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#1d1d1f] font-semibold text-[13px] uppercase tracking-wider mb-4">Stay in the loop</h4>
            <p className="text-[#86868b] text-[13px] mb-4">
              Sign up for exclusive offers, original stories, events and more.
            </p>
            <div className="flex items-center gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="w-full px-4 py-2.5 rounded-lg bg-[#fbfbfd] border border-[rgba(0,0,0,0.08)] text-[14px] focus:outline-none focus:border-[#0071e3] transition-colors"
              />
              <button className="bg-[#1d1d1f] text-white px-4 py-2.5 rounded-lg text-[14px] font-medium hover:bg-[#000] transition-colors">
                Join
              </button>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION */}
        <div className="pt-8 border-t border-[rgba(0,0,0,0.06)] flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-[#86868b]">
          <p>Copyright © {new Date().getFullYear()} Sojan's Store. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#1d1d1f] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#1d1d1f] transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-[#1d1d1f] transition-colors">Legal</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
