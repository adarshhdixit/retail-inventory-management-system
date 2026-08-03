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

const STATUS_STYLES = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  OUT_FOR_DELIVERY: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
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
        <h1 className="text-2xl font-bold text-slate-800">Orders</h1>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-100 text-slate-600 text-sm">
            <tr>
              <th className="p-3">Order #</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Items</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Delivery Person</th>
              <th className="p-3 w-64">Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const nextOptions = STATUS_OPTIONS[o.status] || [];
              const needsStaff = selectedStatus[o.id] === "OUT_FOR_DELIVERY";

              return (
                <tr key={o.id} className="border-t border-slate-100 align-top">
                  <td className="p-3">#{o.id}</td>
                  <td className="p-3">
                    <p className="font-medium">{o.customerName}</p>
                    <p className="text-slate-500 text-sm">{o.phone}</p>
                    <p className="text-slate-400 text-xs">{o.shippingAddress}</p>
                  </td>
                  <td className="p-3 text-sm text-slate-600">
                    {o.items?.map((item, idx) => (
                      <div key={idx}>
                        {item.productName} × {item.quantity}
                      </div>
                    ))}
                  </td>
                  <td className="p-3">₹{o.totalAmount?.toFixed(2)}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        STATUS_STYLES[o.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-slate-600">
                    {o.deliveryPersonName || "—"}
                  </td>
                  <td className="p-3">
                    {nextOptions.length === 0 ? (
                      <span className="text-slate-400 text-sm">No actions</span>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <select
                          value={selectedStatus[o.id] || ""}
                          onChange={(e) =>
                            setSelectedStatus({ ...selectedStatus, [o.id]: e.target.value })
                          }
                          className="border border-slate-300 rounded-md px-2 py-1 text-sm"
                        >
                          <option value="">-- Select status --</option>
                          {nextOptions.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>

                        {needsStaff && (
                          <select
                            value={selectedStaff[o.id] || ""}
                            onChange={(e) =>
                              setSelectedStaff({ ...selectedStaff, [o.id]: e.target.value })
                            }
                            className="border border-slate-300 rounded-md px-2 py-1 text-sm"
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
                          className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
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