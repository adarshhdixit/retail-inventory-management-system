import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axiosInstance';
import { getCustomerLocation } from '../utils/locationCheck';
import Header from '../components/Header';

function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [overrideCoords, setOverrideCoords] = useState(null);
  const [phone, setPhone] = useState('');
  const [serviceability, setServiceability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/addresses').then((res) => {
      setAddresses(res.data);
      const defaultAddr = res.data.find((a) => a.isDefault) || res.data[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    });
  }, []);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const coords =
    overrideCoords ||
    (selectedAddress?.latitude && selectedAddress?.longitude
      ? { latitude: selectedAddress.latitude, longitude: selectedAddress.longitude }
      : null);

  useEffect(() => {
    setServiceability(null);
    if (coords) {
      api
        .get(`/orders/check-serviceability?lat=${coords.latitude}&lng=${coords.longitude}`)
        .then((res) => setServiceability(res.data))
        .catch(() => setServiceability('OUT_OF_RANGE'));
    }
  }, [coords?.latitude, coords?.longitude]);

  const handleDetectForThisOrder = async () => {
    setLocating(true);
    setError('');
    try {
      const c = await getCustomerLocation();
      setOverrideCoords(c);
    } catch {
      setError('Could not detect your location. Please check permissions.');
    } finally {
      setLocating(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      setError('Please select or add a delivery address.');
      return;
    }
    if (!coords) {
      setError('This address has no location saved. Please detect location for this order.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter a contact number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const shippingAddress = `${selectedAddress.houseNumber}, ${selectedAddress.streetName}, near ${selectedAddress.landmark}`;

      const orderPayload = {
        shippingAddress,
        phone,
        customerLatitude: coords.latitude,
        customerLongitude: coords.longitude,
        items: cartItems.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          variantId: item.variant ? item.variant.id : null,
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
        theme: { color: '#FF715B' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong placing your order.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-shop-bg">
      <Header />

      <div className="p-6 md:p-8 max-w-lg mx-auto">
        <h1 className="font-shop-display text-3xl font-bold mb-6 text-shop-text">
          Checkout
        </h1>

        {error && (
          <p className="text-shop-error text-sm mb-4 bg-shop-error/10 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-shop-text">
              Delivery Address
            </label>
            <Link to="/addresses" className="text-xs text-shop-primary hover:underline">
              Manage addresses
            </Link>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-shop-warning/15 text-shop-highlight text-sm p-3 rounded-xl">
              You don't have any saved addresses yet.{' '}
              <Link to="/addresses" className="underline font-medium text-shop-primary">
                Add one
              </Link>{' '}
              before checking out.
            </div>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 border rounded-xl p-3 cursor-pointer transition ${
                    selectedAddressId === addr.id
                      ? 'border-shop-primary bg-shop-primary/5'
                      : 'border-shop-highlight/20 bg-shop-card'
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddressId === addr.id}
                    onChange={() => {
                      setSelectedAddressId(addr.id);
                      setOverrideCoords(null);
                    }}
                    className="mt-1 accent-shop-primary"
                  />
                  <div>
                    <p className="font-medium text-sm text-shop-text">{addr.label}</p>
                    <p className="text-xs text-shop-highlight">
                      {addr.houseNumber}, {addr.streetName}, near {addr.landmark}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {selectedAddress && !coords && (
          <div className="bg-shop-warning/15 text-shop-highlight text-sm p-3 rounded-xl mb-4">
            This address has no location saved, so we can't confirm delivery.
            <button
              type="button"
              onClick={handleDetectForThisOrder}
              disabled={locating}
              className="block mt-2 text-shop-primary underline"
            >
              {locating ? 'Detecting...' : 'Detect location for this order'}
            </button>
          </div>
        )}

        {coords && serviceability === 'DELIVERABLE' && (
          <div className="bg-shop-deliverable/25 text-shop-text text-sm p-3 rounded-xl mb-4 font-medium">
            We deliver to this location — order will reach in 15–20 minutes.
          </div>
        )}

        {coords && serviceability === 'OUT_OF_RANGE' && (
          <div className="bg-shop-error/10 text-shop-error text-sm p-3 rounded-xl mb-4">
            Sorry, this address is outside our delivery area.
          </div>
        )}

        <label className="block text-sm font-medium text-shop-text mb-1">
          Contact Number
        </label>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border border-shop-highlight/20 rounded-xl p-2.5 mb-6 text-sm focus:outline-none focus:border-shop-primary transition"
          placeholder="e.g. 9876543210"
        />

        <p className="text-lg font-bold mb-4 text-shop-text">
          Total: <span className="font-mono">₹{cartTotal.toFixed(2)}</span>
        </p>

        <button
          onClick={handlePlaceOrder}
          disabled={loading || serviceability === 'OUT_OF_RANGE'}
          className="w-full bg-shop-primary text-white py-3 rounded-full font-semibold hover:bg-shop-primary-dark transition disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </div>
  );
}

export default Checkout;