import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

export default function ProductCard({ product, serviceable }) {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const [selectedColors, setSelectedColors] = useState({});

  const getCartQuantity = (productId, variantId) => {
    const item = cartItems.find(
      (i) => i.product.id === productId && (i.variant?.id ?? null) === (variantId ?? null)
    );
    return item ? item.quantity : 0;
  };

  const handleDecrement = (productId, variantId, currentQty) => {
    if (currentQty <= 1) {
      removeFromCart(productId, variantId);
    } else {
      updateQuantity(productId, variantId, currentQty - 1);
    }
  };

  const inStockVariants = (product.variants || []).filter((v) => v.quantity > 0);
  const currentVariant =
    inStockVariants.length > 0
      ? inStockVariants.find((v) => v.id === selectedColors[product.id]) || inStockVariants[0]
      : null;
  const currentVariantId = currentVariant?.id ?? null;
  const cartQty = getCartQuantity(product.id, currentVariantId);

  return (
    <div className="relative bg-shop-card rounded-2xl p-4 shadow-sm hover:shadow-md transition">
      {(product.quantity === 0 || product.deliverable === false) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 rounded-2xl">
          <span className="bg-shop-text text-white text-xs font-bold uppercase tracking-wide px-4 py-2 rounded-full -rotate-6 shadow-md">
            {product.quantity === 0 ? 'Out of Stock' : 'Non Deliverable'}
          </span>
        </div>
      )}

      <Link to={`/product/${product.id}`}>
        <h2 className="font-shop-display font-semibold text-shop-text mb-1">{product.name}</h2>
        <p className="font-mono text-shop-primary-dark font-bold text-sm mb-2">₹{product.price}</p>
      </Link>

      {inStockVariants.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {inStockVariants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedColors({ ...selectedColors, [product.id]: v.id })}
              className={`text-[10px] px-2 py-1 rounded-full border transition ${
                currentVariantId === v.id
                  ? 'border-shop-primary bg-shop-primary/10 text-shop-primary-dark font-semibold'
                  : 'border-shop-highlight/20 text-shop-highlight'
              }`}
            >
              {v.colorName}
            </button>
          ))}
        </div>
      )}

      {cartQty === 0 ? (
        <button
          onClick={() => addToCart(product, 1, currentVariant)}
          disabled={serviceable === false || product.quantity === 0 || product.deliverable === false}
          className={`w-full py-2 rounded-full text-sm font-semibold text-white transition ${
            serviceable === false || product.quantity === 0 || product.deliverable === false
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-shop-text hover:bg-shop-primary'
          }`}
        >
          {product.quantity === 0
            ? 'Out of Stock'
            : product.deliverable === false
            ? 'Non Deliverable'
            : 'Add to Cart'}
        </button>
      ) : (
        <div className="w-full flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-shop-primary-dark bg-shop-primary/10 px-3 py-2 rounded-full whitespace-nowrap">
            In Cart
          </span>
          <div className="flex items-center bg-[#00A7E1] rounded-full overflow-hidden">
            <button
              onClick={() => handleDecrement(product.id, currentVariantId, cartQty)}
              className="px-3 py-1.5 text-white text-lg font-bold transition hover:bg-[#00A7E1] active:bg-[#00A7E1]"
            >
              −
            </button>
            <span className="text-white font-mono font-semibold text-sm px-1">{cartQty}</span>
            <button
              onClick={() => updateQuantity(product.id, currentVariantId, cartQty + 1)}
              className="px-3 py-1.5 text-white text-lg font-bold transition hover:bg-[#00A7E1] active:bg-[#00A7E1]"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}