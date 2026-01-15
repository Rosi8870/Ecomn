export const formatReceiptDate = (date) => {
  if (!date) return "N/A";

  // Firestore Timestamp (Admin SDK)
  if (date._seconds) {
    return new Date(date._seconds * 1000).toLocaleString();
  }

  // Firestore Timestamp (Client SDK)
  if (date.seconds) {
    return new Date(date.seconds * 1000).toLocaleString();
  }

  // JS Date / ISO string
  const d = new Date(date);
  return isNaN(d.getTime()) ? "N/A" : d.toLocaleString();
};

export const printReceipt = (order) => {
  const orderDate = formatReceiptDate(
    order.paymentSubmittedAt || order.createdAt
  );

  const html = `
  <html>
    <head>
      <title>Order Receipt</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 24px;
          color: #111;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .store {
          font-size: 22px;
          font-weight: bold;
        }
        .meta {
          font-size: 14px;
          text-align: right;
        }
        hr {
          margin: 14px 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        th, td {
          border-bottom: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          font-size: 14px;
        }
        th {
          background: #f4f4f4;
        }
        .total {
          text-align: right;
          font-size: 18px;
          font-weight: bold;
          margin-top: 12px;
        }
        .footer {
          margin-top: 28px;
          font-size: 12px;
          text-align: center;
          color: #666;
        }
      </style>
    </head>

    <body>
      <div class="header">
        <div class="store">🛍 MyStore</div>
        <div class="meta">
          <div><b>Order Date:</b> ${orderDate}</div>
          <div><b>Status:</b> ${order.status.replace("_", " ")}</div>
        </div>
      </div>

      <hr />

      <p><b>Order ID:</b> ${order.id}</p>
      <p><b>Customer:</b> ${order.address?.name || "-"}</p>
      <p><b>Address:</b> ${order.address?.address || "-"}</p>
      <p><b>Payment:</b> UPI (${order.paymentTxnId})</p>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          ${order.items
            .map(
              (i) =>
                `<tr>
                  <td>${i.name}</td>
                  <td>${i.quantity}</td>
                  <td>₹${i.price}</td>
                </tr>`
            )
            .join("")}
        </tbody>
      </table>

      <div class="total">
        Total: ₹${order.totalAmount}
      </div>

      <div class="footer">
        Thank you for shopping with MyStore
      </div>

      <script>
        window.print();
        window.onafterprint = () => window.close();
      </script>
    </body>
  </html>
  `;

  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  iframe.contentWindow.document.open();
  iframe.contentWindow.document.write(html);
  iframe.contentWindow.document.close();
};
