import { useState } from "react";
import { X, Copy } from "lucide-react";
import { STORE_UPI_ID, STORE_NAME } from "../config/upi";
import { errorToast, successToast } from "../utils/toast";

function UpiPaymentModal({ amount, orderId, onSubmit, onClose }) {
  const [txnId, setTxnId] = useState("");

  const upiLink = `upi://pay?pa=${STORE_UPI_ID}&pn=${STORE_NAME}&am=${amount}&cu=INR`;

  const handleConfirm = () => {
    if (!txnId.trim()) {
      errorToast("Please enter the UPI Transaction ID");
      return;
    }
    onSubmit(txnId);
    successToast("Payment details submitted");
  };

  const copyUpi = async () => {
    await navigator.clipboard.writeText(STORE_UPI_ID);
    successToast("UPI ID copied");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">

      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* MODAL */}
      <div
        className="
          relative w-full max-w-[500px]
          premium-card bg-white
          p-8 sm:p-10
          animate-fade-in
        "
      >
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 text-[#86868b] hover:text-[#1d1d1f] transition-colors p-2 rounded-full hover:bg-[#f5f5f7]"
        >
          <X size={20} />
        </button>

        {/* HEADER */}
        <div className="mb-8 pr-8">
          <p className="text-[11px] text-[#0071e3] font-bold tracking-widest uppercase mb-2">
            Step 3 of 3
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
            Complete Payment
          </h2>
          <p className="text-[15px] text-[#86868b] mt-2">
            Pay securely using UPI
          </p>
        </div>

        {/* AMOUNT */}
        <div className="mb-8 rounded-2xl bg-[#fbfbfd] border border-[rgba(0,0,0,0.06)] p-6 flex flex-col items-center justify-center text-center">
          <p className="text-[14px] text-[#86868b] font-medium mb-1">
            Amount to Pay
          </p>
          <p className="text-4xl font-bold text-[#1d1d1f] tracking-tight">
            ₹{amount}
          </p>
        </div>

        {/* UPI INFO */}
        <div className="mb-6">
          <p className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
            Pay to UPI ID
          </p>
          <div className="flex items-center justify-between rounded-xl bg-[#fbfbfd] border border-[rgba(0,0,0,0.08)] px-4 py-3">
            <span className="font-mono text-[15px] text-[#1d1d1f]">
              {STORE_UPI_ID}
            </span>
            <button onClick={copyUpi} className="text-[#86868b] hover:text-[#0071e3] transition-colors">
              <Copy size={18} />
            </button>
          </div>
        </div>

        {/* OPEN UPI APP */}
        <a
          href={upiLink}
          className="w-full outline-btn flex items-center justify-center mb-8 h-12"
        >
          Open UPI App
        </a>

        <div className="h-px bg-[rgba(0,0,0,0.06)] w-full mb-8" />

        {/* TXN INPUT */}
        <div className="mb-8">
          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
            UPI Transaction ID
          </label>
          <input
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            placeholder="Paste 12-digit transaction ID here"
            className="
              w-full rounded-xl
              bg-[#fbfbfd] border border-[rgba(0,0,0,0.08)]
              px-4 py-3 text-[#1d1d1f] text-[15px]
              placeholder:text-[#86868b]
              focus:outline-none focus:border-[#0071e3] focus:ring-1 focus:ring-[#0071e3]
              transition-all
            "
          />
          <p className="text-[12px] text-[#86868b] mt-2 font-medium">
            This is required to manually verify your payment.
          </p>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center pt-6 border-t border-[rgba(0,0,0,0.06)]">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-[15px] font-medium text-[#1d1d1f] rounded-xl hover:bg-[#f5f5f7] transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            className="primary-btn px-8"
          >
            Submit Payment
          </button>
        </div>

        {/* TRUST */}
        <p className="text-[12px] text-[#86868b] mt-6 text-center font-medium">
          🔒 Secure payment • Verified manually • No extra charges
        </p>
      </div>
    </div>
  );
}

export default UpiPaymentModal;
