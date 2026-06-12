import { X } from "lucide-react";
import { errorToast } from "../utils/toast";

export default function AddressModal({
  profile,
  onSubmit,
  onClose,
}) {
  const isLocked =
    profile?.address &&
    profile?.city &&
    profile?.pincode &&
    profile?.name;

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      name: e.target.name.value.trim(),
      address: e.target.address.value.trim(),
      city: e.target.city.value.trim(),
      pincode: e.target.pincode.value.trim(),
    };

    if (!data.name || !data.address || !data.city || !data.pincode) {
      errorToast("Please fill all delivery details");
      return;
    }

    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* MODAL */}
      <form
        onSubmit={handleSubmit}
        className="
          relative w-full max-w-[500px]
          premium-card bg-white
          p-8 sm:p-10
          animate-fade-in
        "
      >
        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-[#86868b] hover:text-[#1d1d1f] transition-colors p-2 rounded-full hover:bg-[#f5f5f7]"
        >
          <X size={20} />
        </button>

        {/* HEADER */}
        <div className="mb-8 pr-8">
          <p className="text-[11px] text-[#0071e3] font-bold tracking-widest uppercase mb-2">
            Step 2 of 3
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
            Delivery Address
          </h2>
          <p className="text-[15px] text-[#86868b] mt-2">
            {isLocked
              ? "Using your saved delivery address"
              : "Enter the address where you want your order delivered"}
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-4">
          <Input
            name="name"
            label="Full Name"
            defaultValue={profile?.name || ""}
            disabled={isLocked}
          />

          <Textarea
            name="address"
            label="Full Address"
            defaultValue={profile?.address || ""}
            style={{ resize: "none" }}
            disabled={isLocked}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="city"
              label="City"
              defaultValue={profile?.city || ""}
              disabled={isLocked}
            />
            <Input
              name="pincode"
              label="Pincode"
              defaultValue={profile?.pincode || ""}
              disabled={isLocked}
            />
          </div>
        </div>

        {/* INFO */}
        {isLocked && (
          <p className="text-[13px] text-[#86868b] mt-4 font-medium">
            To change address, update it from your Profile page
          </p>
        )}

        {/* ACTIONS */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-[rgba(0,0,0,0.06)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-[15px] font-medium text-[#1d1d1f] rounded-xl hover:bg-[#f5f5f7] transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-btn px-8"
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
}

/* ===== INPUT COMPONENTS ===== */

function Input({ label, disabled, ...props }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
        {label}
      </label>
      <input
        {...props}
        disabled={disabled}
        className={`
          w-full rounded-xl
          px-4 py-3 text-[15px]
          placeholder:text-[#86868b]
          focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]
          transition-all
          ${
            disabled
              ? "bg-[#f5f5f7] border border-[rgba(0,0,0,0.04)] text-[#86868b] cursor-not-allowed"
              : "bg-[#fbfbfd] border border-[rgba(0,0,0,0.08)] text-[#1d1d1f]"
          }
        `}
      />
    </div>
  );
}

function Textarea({ label, disabled, ...props }) {
  return (
    <div>
      <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
        {label}
      </label>
      <textarea
        {...props}
        rows={3}
        disabled={disabled}
        className={`
          w-full rounded-xl
          px-4 py-3 text-[15px]
          placeholder:text-[#86868b]
          focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]
          transition-all
          ${
            disabled
              ? "bg-[#f5f5f7] border border-[rgba(0,0,0,0.04)] text-[#86868b] cursor-not-allowed"
              : "bg-[#fbfbfd] border border-[rgba(0,0,0,0.08)] text-[#1d1d1f]"
          }
        `}
      />
    </div>
  );
}
