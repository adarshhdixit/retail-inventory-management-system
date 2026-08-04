import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Header from '../components/Header';

const STATUS_STYLES = {
  PENDING: 'bg-shop-warning/20 text-shop-highlight',
  PAID: 'bg-shop-accent/15 text-shop-accent',
  OUT_FOR_DELIVERY: 'bg-shop-primary/15 text-shop-primary-dark',
  DELIVERED: 'bg-shop-deliverable/30 text-shop-text',
  CANCELLED: 'bg-shop-error/10 text-shop-error',
};

const STATUS_LABELS = {
  PENDING: 'Payment Pending',
  PAID: 'Confirmed',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axiosInstance
      .get('/orders/my-orders')
      .then((res) => setOrders(res.data))
      .catch(() => setError('Could not load your orders. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-shop-bg">
      <Header />

      <div className="p-6 md:p-8">
        <h1 className="font-shop-display text-3xl font-bold mb-6 text-shop-text">
          My Orders
        </h1>

        {loading && <p className="text-shop-highlight">Loading your orders...</p>}
        {error && <p className="text-shop-error">{error}</p>}

        {!loading && !error && orders.length === 0 && (
          <p className="text-shop-highlight">You haven't placed any orders yet.</p>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4 max-w-2xl">
            {orders.map((order) => (
              <div key={order.id} className="bg-shop-card rounded-2xl shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium text-shop-text">Order #{order.id}</p>
                    <p className="text-sm text-shop-highlight">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      STATUS_STYLES[order.status] || 'bg-shop-highlight/10 text-shop-highlight'
                    }`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>

                {order.deliveryPersonName && order.status === 'OUT_FOR_DELIVERY' && (
                  <p className="text-xs text-shop-primary-dark font-medium mb-3">
                    {order.deliveryPersonName} is on the way with your order
                  </p>
                )}

                <div className="border-t border-shop-highlight/10 pt-3 space-y-1">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm text-shop-text">
                      <span>
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="font-mono">
                        ₹{(item.priceAtPurchase * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-shop-highlight/10 mt-3 pt-3 flex justify-between items-center">
                  <p className="text-sm text-shop-highlight">{order.shippingAddress}</p>
                  <p className="font-bold text-shop-text font-mono">
                    ₹{order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <Link to="/store" className="inline-block mt-6 text-shop-highlight text-sm hover:text-shop-primary transition">
          ← Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default MyOrders;