import { publicApi } from '../api/axiosInstance';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();

  useEffect(() => {
    publicApi
      .get(`/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch(() => setNotFound(true));
  }, [id]);

  const inStockVariants = product ? (product.variants || []).filter((v) => v.quantity > 0) : [];

  const currentVariant =
    inStockVariants.length > 0
      ? inStockVariants.find((v) => v.id === selectedVariantId) || inStockVariants[0]
      : null;
  const currentVariantId = currentVariant?.id ?? null;

  const cartQuantity = product
    ? cartItems.find(
        (i) =>
          i.product.id === product.id &&
          (i.variant?.id ?? null) === currentVariantId
      )?.quantity || 0
    : 0;

  const handleDecrement = () => {
    if (cartQuantity <= 1) {
      removeFromCart(product.id, currentVariantId);
    } else {
      updateQuantity(product.id, currentVariantId, cartQuantity - 1);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-shop-bg flex flex-col items-center justify-center">
        <p className="text-shop-highlight mb-4">Product not found.</p>
        <Link to="/store" className="text-shop-primary hover:underline">
          ← Back to store
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-shop-bg flex items-center justify-center">
        <p className="text-shop-highlight">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-shop-bg">
      <Header />

      <div className="p-6 md:p-8">
        <Link to="/store" className="text-shop-highlight text-sm hover:text-shop-primary transition inline-block mb-6">
          ← Back to store
        </Link>

        <div className="max-w-2xl mx-auto bg-shop-card rounded-2xl shadow-sm p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-shop-highlight mb-2">
            {product.categoryName || 'Uncategorized'}
            {product.subCategory && ` · ${product.subCategory}`}
          </p>
          <h1 className="font-shop-display text-2xl font-bold text-shop-text mb-3">
            {product.name}
          </h1>
          <p className="font-mono text-3xl font-bold text-shop-primary-dark mb-4">
            ₹{product.price}
          </p>
          <p
            className={`text-sm mb-6 font-medium ${
              product.quantity > 0 ? 'text-shop-highlight' : 'text-shop-error'
            }`}
          >
            {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
          </p>

          {inStockVariants.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-shop-text mb-2">Ink Color</p>
              <div className="flex flex-wrap gap-2">
                {inStockVariants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`text-sm px-4 py-2 rounded-full border-2 transition ${
                      currentVariantId === v.id
                        ? 'border-shop-primary bg-shop-primary/10 text-shop-primary-dark font-semibold'
                        : 'border-shop-highlight/20 text-shop-highlight'
                    }`}
                  >
                    {v.colorName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.quantity === 0 ? (
            <button
              disabled
              className="px-8 py-3 rounded-full text-white font-semibold bg-gray-300 cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : cartQuantity === 0 ? (
            <button
              onClick={() => addToCart(product, 1, currentVariant)}
              className="px-8 py-3 rounded-full text-white font-semibold bg-shop-text hover:bg-shop-primary transition"
            >
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-shop-primary-dark bg-shop-primary/10 px-4 py-3 rounded-full">
                In Cart
              </span>
              <div className="flex items-center bg-[#00A7E1] rounded-full overflow-hidden">
                <button
                  onClick={handleDecrement}
                  className="px-4 py-2.5 text-white text-lg font-bold transition hover:bg-[#00A7E1] active:bg-[#00A7E1]"
                >
                  −
                </button>
                <span className="text-white font-mono font-semibold text-sm px-2">
                  {cartQuantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, currentVariantId, cartQuantity + 1)}
                  disabled={cartQuantity >= product.quantity}
                  className="px-4 py-2.5 text-white text-lg font-bold transition hover:bg-[#00A7E1] active:bg-[#00A7E1] disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;