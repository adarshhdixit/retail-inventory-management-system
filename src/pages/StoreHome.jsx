import { publicApi } from '../api/axiosInstance';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { getCustomerLocation } from '../utils/locationCheck';
import AccountMenu from '../components/AccountMenu';



function StoreHome() {
  const [products, setProducts] = useState([]);
  const [serviceable, setServiceable] = useState(null); // null = checking, true/false/'unknown' once known
  const { addToCart, cartItems } = useCart();

  useEffect(() => {
    publicApi.get('/products').then((res) => {
      setProducts(res.data.content || res.data);
    });

    checkLocation();
  }, []);

  const checkLocation = () => {
    setServiceable(null);
    getCustomerLocation()
      .then((coords) => {
        return publicApi.get('/orders/check-serviceability', {
          params: { lat: coords.latitude, lng: coords.longitude },
        });
      })
      .then((res) => {
        setServiceable(res.data === 'DELIVERABLE');
      })
      .catch((error) => {
        if (error.code === 1 /* PERMISSION_DENIED */) {
          alert(
            "Location is blocked for this site. Please enable it manually:\n\n" +
            "Click the padlock icon next to the website address → Site settings → Location → Allow.\n\n" +
            "Then click 'Enable Location' again."
          );
        }
        setServiceable('unknown');
      });
  };


  const totalItemsInCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {serviceable === false && (
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-md mb-6">
          Sorry, we currently don't deliver to your location. You can still browse, but ordering isn't available yet.
        </div>
      )}
      {serviceable === true && (
        <div className="bg-green-100 text-green-700 px-4 py-3 rounded-md mb-6">
          Great news — we deliver to your area!
        </div>
      )}
      {serviceable === 'unknown' && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-3 rounded-md mb-6 flex justify-between items-center">
          <span>We need your location to check if we deliver to you.</span>
          <button
            onClick={checkLocation}
            className="bg-yellow-600 text-white px-3 py-1 rounded-md text-sm hover:bg-yellow-700"
          >
            Enable Location
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Our Products</h1>
        <div className="flex gap-3 items-center">
          <AccountMenu />
          <Link
            to="/cart"
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Cart ({totalItemsInCart})
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow p-4">
            <Link to={`/product/${product.id}`}>
              <h2 className="font-semibold text-gray-800">{product.name}</h2>
              <p className="text-gray-500 text-sm mb-2">₹{product.price}</p>
            </Link>
            <button
              onClick={() => addToCart(product)}
              disabled={serviceable === false}
              className={`w-full py-1.5 rounded-md text-sm text-white ${
                serviceable === false
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StoreHome;