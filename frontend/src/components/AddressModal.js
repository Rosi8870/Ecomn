import { X } from "lucide-react";
import { errorToast } from "../utils/toast";

export default function AddressModal({ onSubmit, onClose }) {
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
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* MODAL */}
      <form
        onSubmit={handleSubmit}
        className="
          relative
          w-full max-w-lg
          rounded-2xl
          bg-[#0f2027]
          border border-white/10
          p-6 sm:p-8
          text-white
        "
      >
        {/* CLOSE */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-white/60 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* HEADER */}
        <div className="mb-6">
          <p className="text-xs text-cyan-400 font-semibold mb-1">
            STEP 2 OF 3
          </p>
          <h2 className="text-2xl font-bold">
            Delivery Address
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            Enter the address where you want your order delivered
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-4">
          <Input
            name="name"
            label="Full Name"
            placeholder="John Doe"
          />

          <Textarea
            name="address"
            label="Full Address"
            placeholder="House no, street, area"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              name="city"
              label="City"
              placeholder="Chennai"
            />
            <Input
              name="pincode"
              label="Pincode"
              placeholder="600001"
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-between items-center mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="
              px-6 py-2.5
              rounded-lg
              bg-cyan-400
              text-black
              font-semibold
              hover:bg-cyan-300
            "
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
}

/* ===== INPUT COMPONENTS ===== */

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm mb-1 text-gray-300">
        {label}
      </label>
      <input
        {...props}
        required
        className="
          w-full
          rounded-lg
          bg-white/10
          border border-white/20
          px-3 py-2
          text-white
          placeholder:text-gray-400
          focus:outline-none
          focus:border-cyan-400
        "
      />
    </div>
  );
}

function Textarea({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm mb-1 text-gray-300">
        {label}
      </label>
      <textarea
        {...props}
        required
        rows={3}
        className="
          w-full
          rounded-lg
          bg-white/10
          border border-white/20
          px-3 py-2
          text-white
          placeholder:text-gray-400
          focus:outline-none
          focus:border-cyan-400
        "
      />
    </div>
  );
}
