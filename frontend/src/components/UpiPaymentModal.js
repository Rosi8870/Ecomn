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
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* MODAL */}
      <div
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
          onClick={onClose}
          className="absolute right-4 top-4 text-white/60 hover:text-white"
        >
          <X size={20} />
        </button>

        {/* HEADER */}
        <div className="mb-6">
          <p className="text-xs text-cyan-400 font-semibold mb-1">
            STEP 3 OF 3
          </p>
          <h2 className="text-2xl font-bold">
            Complete Payment
          </h2>
          <p className="text-sm text-gray-300 mt-1">
            Pay securely using UPI
          </p>
        </div>

        {/* AMOUNT */}
        <div className="mb-6 rounded-xl bg-white/10 p-4 text-center">
          <p className="text-sm text-gray-300">
            Amount to Pay
          </p>
          <p className="text-3xl font-extrabold text-cyan-300">
            ₹{amount}
          </p>
        </div>

        {/* UPI INFO */}
        <div className="mb-5">
          <p className="text-sm text-gray-300 mb-1">
            Pay to UPI ID
          </p>
          <div className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2">
            <span className="font-mono text-sm">
              {STORE_UPI_ID}
            </span>
            <button onClick={copyUpi}>
              <Copy size={18} />
            </button>
          </div>
        </div>

        {/* OPEN UPI APP */}
        <a
          href={upiLink}
          className="
            block w-full text-center
            rounded-xl
            bg-cyan-400
            text-black
            font-semibold
            py-3
            mb-6
            hover:bg-cyan-300
          "
        >
          Open UPI App
        </a>

        {/* TXN INPUT */}
        <div className="mb-6">
          <label className="block text-sm text-gray-300 mb-1">
            UPI Transaction ID
          </label>
          <input
            value={txnId}
            onChange={(e) => setTxnId(e.target.value)}
            placeholder="Paste transaction ID here"
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
          <p className="text-xs text-gray-400 mt-1">
            This is required to verify your payment
          </p>
        </div>

        {/* FOOTER */}
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            className="
              px-6 py-2.5
              rounded-lg
              bg-cyan-400
              text-black
              font-semibold
              hover:bg-cyan-300
            "
          >
            Submit Payment
          </button>
        </div>

        {/* TRUST */}
        <p className="text-xs text-gray-400 mt-5 text-center">
          🔒 Secure payment • Verified manually • No extra charges
        </p>
      </div>
    </div>
  );
}

export default UpiPaymentModal;
