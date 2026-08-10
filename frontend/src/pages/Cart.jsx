import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-shop-bg">
      <Header />

      <div className="p-6 md:p-8">
        <h1 className="font-shop-display text-3xl font-bold mb-6 text-shop-text">
          Your Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <svg width="180" height="160" viewBox="0 0 180 160" className="mb-4">
              <circle cx="90" cy="85" r="70" fill="#00A7E1" opacity="0.06" />

              <path d="M100 35 Q115 30 128 38" stroke="#00A7E1" strokeWidth="1.5" strokeDasharray="3 4" fill="none" opacity="0.5" strokeLinecap="round" />
              <path d="M108 22 Q120 18 130 24" stroke="#00A7E1" strokeWidth="1.5" strokeDasharray="3 4" fill="none" opacity="0.35" strokeLinecap="round" />

              <g transform="translate(118, 20) rotate(20)">
                <path
                  d="M0 0 L26 8 L4 12 L0 22 L-4 12 Z"
                  fill="none"
                  stroke="#00A7E1"
                  strokeWidth="2.2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                <line x1="4" y1="12" x2="26" y2="8" stroke="#00A7E1" strokeWidth="1.5" opacity="0.6" />
              </g>

              <path
                d="M35 55h10l6 55h60l10-45H58"
                fill="none"
                stroke="#00A7E1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="62" cy="128" r="7" fill="none" stroke="#00A7E1" strokeWidth="2.5" />
              <circle cx="98" cy="128" r="7" fill="none" stroke="#00A7E1" strokeWidth="2.5" />

              <path d="M140 60 l3 7 7 3 -7 3 -3 7 -3-7 -7-3 7-3z" fill="#00A7E1" opacity="0.4" />
              <circle cx="45" cy="35" r="2.5" fill="#00A7E1" opacity="0.4" />
            </svg>
            <h2 className="font-shop-display text-lg font-bold text-shop-text mb-1">
              Your cart is empty
            </h2>
            <p className="text-sm text-shop-highlight max-w-xs">
              Looks like you haven't added anything yet. Let's fix that.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-shop-card rounded-2xl shadow-sm divide-y divide-shop-highlight/10 max-w-2xl">
              {cartItems.map((item) => {
                const variantId = item.variant?.id ?? null;
                return (
                  <div
                    key={`${item.product.id}-${variantId ?? 'default'}`}
                    className="flex justify-between items-center p-4"
                  >
                    <div>
                      <p className="font-medium text-shop-text">{item.product.name}</p>
                      {item.variant && (
                        <p className="text-xs text-shop-primary-dark font-medium">
                          Color: {item.variant.colorName}
                        </p>
                      )}
                      <p className="text-sm text-shop-highlight">
                        ₹{item.product.price} each
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-shop-highlight/20 rounded-full overflow-hidden">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, variantId, item.quantity - 1)
                          }
                          className="px-3 py-1 text-lg text-shop-text hover:bg-shop-bg transition"
                        >
                          −
                        </button>
                        <span className="px-4 font-mono text-sm text-shop-text">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, variantId, item.quantity + 1)
                          }
                          className="px-3 py-1 text-lg text-shop-text hover:bg-shop-bg transition"
                        >
                          +
                        </button>
                      </div>

                      <p className="w-20 text-right font-mono font-semibold text-shop-text">
                        ₹{(item.product.price * item.quantity).toFixed(2)}
                      </p>

                      <button
                        onClick={() => removeFromCart(item.product.id, variantId)}
                        className="text-shop-error text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-between items-center max-w-2xl">
              <p className="text-xl font-bold text-shop-text">
                Total: <span className="font-mono">₹{cartTotal.toFixed(2)}</span>
              </p>
              <button
                onClick={() => navigate('/checkout')}
                className="bg-shop-primary text-white px-6 py-2.5 rounded-full font-semibold hover:bg-shop-primary-dark transition shadow-sm"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}

        <Link to="/store" className="inline-block mt-6 text-shop-highlight text-sm hover:text-shop-primary transition">
          ← Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default Cart;