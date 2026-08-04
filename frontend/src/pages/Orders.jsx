import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Layout from "../components/Layout";

const STATUS_OPTIONS = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const STATUS_STAMP = {
  PENDING: "border-slate-text text-slate-text -rotate-2",
  PAID: "border-brass-dark text-brass-dark rotate-1",
  OUT_FOR_DELIVERY: "border-yellow-500 text-yellow-600 -rotate-1",
  DELIVERED: "border-sage text-sage rotate-2",
  CANCELLED: "border-stamp text-stamp -rotate-3",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState({});
  const [selectedStaff, setSelectedStaff] = useState({});

  const loadOrders = () => {
    axiosInstance
      .get("/orders")
      .then((res) => setOrders(res.data))
      .catch(() => setError("Failed to load orders"));
  };

  useEffect(() => {
    loadOrders();
    axiosInstance.get("/staff").then((res) => setStaff(res.data));
  }, []);

  const handleUpdate = async (orderId) => {
    const newStatus = selectedStatus[orderId];
    const deliveryPersonName = selectedStaff[orderId];

    if (!newStatus) {
      setError("Please select a status first");
      return;
    }

    try {
      const params = new URLSearchParams({ status: newStatus });
      if (deliveryPersonName) {
        params.append("deliveryPersonName", deliveryPersonName);
      }
      await axiosInstance.patch(`/orders/${orderId}/status?${params.toString()}`);
      setError("");
      loadOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update order status");
    }
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Orders</h1>
      </div>

      {error && (
        <div className="bg-stamp/10 text-stamp p-3 rounded-sm mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-sm border border-ledger-line overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-ledger text-ink text-xs uppercase tracking-wide">
            <tr>
              <th className="p-3 font-semibold">Order #</th>
              <th className="p-3 font-semibold">Customer</th>
              <th className="p-3 font-semibold">Items</th>
              <th className="p-3 font-semibold">Total</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Delivery Person</th>
              <th className="p-3 font-semibold w-64">Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const nextOptions = STATUS_OPTIONS[o.status] || [];
              const needsStaff = selectedStatus[o.id] === "OUT_FOR_DELIVERY";

              return (
                <tr key={o.id} className="border-t border-ledger-line align-top">
                  <td className="p-3 font-mono text-sm text-ink">#{o.id}</td>
                  <td className="p-3">
                    <p className="text-ink text-sm font-medium">{o.customerName}</p>
                    <p className="text-slate-text text-sm font-mono">{o.phone}</p>
                    <p className="text-slate-text/70 text-xs">{o.shippingAddress}</p>
                  </td>
                  <td className="p-3 text-sm text-slate-text">
                    {o.items?.map((item, idx) => (
                      <div key={idx}>
                        {item.productName} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="p-3 font-mono text-sm text-ink">
                    ₹{o.totalAmount?.toFixed(2)}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-block px-2 py-1 border-2 rounded-sm text-xs font-semibold uppercase tracking-wide bg-white ${
                        STATUS_STAMP[o.status] || "border-slate-text text-slate-text"
                      }`}
                    >
                      {o.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-ink">
                    {o.deliveryPersonName || (
                      <span className="text-slate-text/50">—</span>
                    )}
                  </td>
                  <td className="p-3">
                    {nextOptions.length === 0 ? (
                      <span className="text-slate-text/50 text-sm">No actions</span>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <select
                          value={selectedStatus[o.id] || ""}
                          onChange={(e) =>
                            setSelectedStatus({ ...selectedStatus, [o.id]: e.target.value })
                          }
                          className="border border-ledger-line rounded-sm px-2 py-1 text-sm focus:outline-none focus:border-brass"
                        >
                          <option value="">-- Select status --</option>
                          {nextOptions.map((s) => (
                            <option key={s} value={s}>
                              {s.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>

                        {needsStaff && (
                          <select
                            value={selectedStaff[o.id] || ""}
                            onChange={(e) =>
                              setSelectedStaff({ ...selectedStaff, [o.id]: e.target.value })
                            }
                            className="border border-ledger-line rounded-sm px-2 py-1 text-sm focus:outline-none focus:border-brass"
                          >
                            <option value="">-- Select delivery person --</option>
                            {staff.map((s) => (
                              <option key={s.id} value={s.name}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        )}

                        <button
                          onClick={() => handleUpdate(o.id)}
                          className="bg-brass hover:bg-brass-dark text-white px-3 py-1 rounded-sm text-sm transition"
                        >
                          Update
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}