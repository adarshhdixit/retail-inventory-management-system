import { publicApi } from '../api/axiosInstance';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getCustomerLocation } from '../utils/locationCheck';
import Header from '../components/Header';

function StoreHome() {
  const [products, setProducts] = useState([]);
  const [serviceable, setServiceable] = useState(null);
  const { addToCart } = useCart();

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
        if (error.code === 1) {
          alert(
            "Location is blocked for this site. Please enable it manually:\n\n" +
            "Click the padlock icon next to the website address → Site settings → Location → Allow.\n\n" +
            "Then click 'Enable Location' again."
          );
        }
        setServiceable('unknown');
      });
  };

  return (
    <div className="min-h-screen bg-shop-bg">
      {/* Slim marquee delivery strip — scrolls away, sits above the sticky header */}
      {serviceable !== null && (
        <div
          className={`overflow-hidden py-1.5 ${
            serviceable === true
              ? 'bg-shop-deliverable'
              : serviceable === false
              ? 'bg-shop-error'
              : 'bg-shop-highlight'
          }`}
        >
          <div className="animate-marquee flex whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
              <span key={i} className="flex items-center text-white text-xs font-medium tracking-wide">
                {Array(6)
                  .fill(
                    serviceable === true
                      ? ' WE DELIVER TO YOUR AREA'
                      : serviceable === false
                      ? "WE DON'T DELIVER TO YOUR LOCATION YET"
                      : 'ENABLE LOCATION TO CHECK DELIVERY'
                  )
                  .map((text, j) => (
                    <span key={j} className="mx-6 flex items-center gap-6">
                      {text}
                      {serviceable === true && <span>FREE DELIVERY ON ORDERS ABOVE ₹299</span>}
                      <span className="opacity-60">•</span>
                    </span>
                  ))}
              </span>
            ))}
          </div>
        </div>
      )}

      {serviceable === 'unknown' && (
        <div className="bg-shop-highlight/10 px-6 py-2 flex justify-center">
          <button
            onClick={checkLocation}
            className="text-shop-highlight text-xs underline underline-offset-2 hover:opacity-80"
          >
            Enable Location
          </button>
        </div>
      )}

      <Header />

      <div className="p-6 md:p-8">
        <h1 className="font-shop-display text-3xl md:text-4xl font-bold text-shop-text mb-1">
          Our Products
        </h1>
        <p className="text-shop-highlight/70 text-sm mb-8">
          Everything for your desk, delivered fast.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-shop-card rounded-2xl p-4 shadow-sm hover:shadow-md transition"
            >
              <Link to={`/product/${product.id}`}>
                <h2 className="font-shop-display font-semibold text-shop-text mb-1">
                  {product.name}
                </h2>
                <p className="font-mono text-shop-primary-dark font-bold text-sm mb-3">
                  ₹{product.price}
                </p>
              </Link>
              <button
                onClick={() => addToCart(product)}
                disabled={serviceable === false}
                className={`w-full py-2 rounded-full text-sm font-semibold text-white transition ${
                  serviceable === false
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-shop-text hover:bg-shop-primary'
                }`}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StoreHome;