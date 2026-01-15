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
                      completed ? "bg-cyan-400" : "bg-white/30"
                    }`}
                  />
                  {index !== steps.length - 1 && (
                    <div
                      className={`w-px h-8 ${
                        completed ? "bg-cyan-400" : "bg-white/20"
                      }`}
                    />
                  )}
                </div>

                <p
                  className={`text-sm ${
                    completed ? "text-cyan-300" : "text-gray-400"
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
        <div className="absolute top-2 left-0 right-0 h-px bg-white/20" />

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
                    completed ? "bg-cyan-400" : "bg-white/30"
                  }`}
                />

                {/* LABEL */}
                <span
                  className={`mt-2 text-xs ${
                    completed ? "text-cyan-300" : "text-gray-400"
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
