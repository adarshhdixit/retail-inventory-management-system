import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axiosInstance';
import { getCustomerLocation } from '../utils/locationCheck';

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePlaceOrder = async () => {
    setLoading(true);

    let coords;
    try {
      coords = await getCustomerLocation();
    } catch (error) {
      setLoading(false);

      if (error.code === 1 /* PERMISSION_DENIED */) {
        alert(
          "Location access is blocked for this site. To place an order, please enable it manually:\n\n" +
          "Chrome: click the padlock icon next to the website address → Site settings → Location → Allow\n\n" +
          "Then refresh this page and try again."
        );
      } else {
        alert('Could not determine your location. Please check your device settings and try again.');
      }
      return;
    }

    try {
      const orderPayload = {
        shippingAddress: address,
        phone: phone,
        customerLatitude: coords.latitude,
        customerLongitude: coords.longitude,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const res = await api.post('/orders', orderPayload);
      const { id, totalAmount, razorpayOrderId } = res.data;

      const options = {
        key: 'rzp_test_THFm3urtbtzN9y',
        amount: totalAmount * 100,
        currency: 'INR',
        name: 'Your Shop Name',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        handler: async function (response) {
          await api.post('/orders/confirm-payment', {
            orderId: id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          clearCart();
          navigate('/order-success');
        },
        prefill: { contact: phone },
        theme: { color: '#2563eb' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong placing your order.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Checkout</h1>

      <label className="block text-sm font-medium mb-1">Shipping Address</label>
      <textarea
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full border rounded-md p-2 mb-4"
        rows={3}
      />

      <label className="block text-sm font-medium mb-1">Phone</label>
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full border rounded-md p-2 mb-6"
      />

      <p className="text-lg font-bold mb-4">Total: ₹{cartTotal.toFixed(2)}</p>

      <button
        onClick={handlePlaceOrder}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </div>
  );
}

export default Checkout;