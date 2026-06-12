const steps = [
  { key: "PAYMENT_PENDING", label: "Payment Pending" },
  { key: "PAID", label: "Paid" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
];

function OrderStatus({ status }) {
  const currentStep = steps.findIndex(s => s.key === status);

  return (
    <>
      {/* ================= MOBILE (VERTICAL) ================= */}
      <div className="block sm:hidden mt-4">
        <div className="flex flex-col gap-4">
          {steps.map((step, index) => {
            const completed = index <= currentStep;

            return (
              <div key={step.key} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      completed ? "bg-[#0071e3]" : "bg-[rgba(0,0,0,0.15)]"
                    }`}
                  />
                  {index !== steps.length - 1 && (
                    <div
                      className={`w-px h-8 mt-1 mb-1 ${
                        completed ? "bg-[#0071e3]" : "bg-[rgba(0,0,0,0.1)]"
                      }`}
                    />
                  )}
                </div>

                <p
                  className={`text-[13px] font-medium ${
                    completed ? "text-[#1d1d1f]" : "text-[#86868b]"
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= DESKTOP (HORIZONTAL – FIXED) ================= */}
      <div className="hidden sm:block mt-6 relative">
        {/* LINE BEHIND DOTS */}
        <div className="absolute top-1.5 left-0 right-0 h-px bg-[rgba(0,0,0,0.1)]" />

        <div className="grid grid-cols-4 gap-0 relative">
          {steps.map((step, index) => {
            const completed = index <= currentStep;

            return (
              <div
                key={step.key}
                className="flex flex-col items-center"
              >
                {/* DOT */}
                <div
                  className={`w-3 h-3 rounded-full z-10 ${
                    completed ? "bg-[#0071e3] shadow-[0_0_0_4px_rgba(0,113,227,0.1)]" : "bg-[rgba(0,0,0,0.15)]"
                  }`}
                />

                {/* LABEL */}
                <span
                  className={`mt-3 text-[12px] font-medium ${
                    completed ? "text-[#1d1d1f]" : "text-[#86868b]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default OrderStatus;
