import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import StarRating from './StarRating';

export default function PopularProductCard({ product }) {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const cartItem = cartItems.find((i) => i.product.id === product.id && !i.variant);
  const cartQty = cartItem ? cartItem.quantity : 0;
  const hasDiscount = product.mrpPrice && product.mrpPrice > product.price;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
      <Link to={`/product/${product.id}`} className="block h-32 md:h-40 bg-shop-bg">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-shop-highlight/30 text-3xl">
            📦
          </div>
        )}
      </Link>

      <div className="p-3 flex flex-col gap-2">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-xs font-semibold text-shop-text leading-tight line-clamp-2 h-8">
            {product.name}
          </h3>
        </Link>

        {product.rating != null && (
          <div className="flex items-center gap-1">
            <StarRating rating={product.rating} size={11} />
            <span className="text-[10px] text-shop-highlight">{product.rating.toFixed(1)}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="bg-white border border-shop-highlight/15 shadow-md rounded-lg px-2.5 py-1">
            <span className="font-mono font-bold text-sm text-shop-primary-dark">
              ₹{product.price}
            </span>
          </div>
          {hasDiscount && (
            <span className="font-mono text-xs text-shop-highlight/60 line-through">
              ₹{product.mrpPrice}
            </span>
          )}
        </div>

        <div className="mt-1">
          {cartQty === 0 ? (
            <button
              onClick={() => addToCart(product, 1, null)}
              className="w-full bg-shop-text text-white text-xs font-semibold py-2 rounded-full hover:bg-shop-primary transition"
            >
              Add
            </button>
          ) : (
            <div className="flex items-center justify-between bg-[#00A7E1] rounded-full w-full">
              <button
                onClick={() => {
                  if (cartQty <= 1) {
                    removeFromCart(product.id, null);
                  } else {
                    updateQuantity(product.id, null, cartQty - 1);
                  }
                }}
                className="w-8 h-8 flex items-center justify-center text-white text-base font-bold"
              >
                −
              </button>
              <span className="text-white font-mono font-semibold text-sm">{cartQty}</span>
              <button
                onClick={() => updateQuantity(product.id, null, cartQty + 1)}
                className="w-8 h-8 flex items-center justify-center text-white text-base font-bold"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}