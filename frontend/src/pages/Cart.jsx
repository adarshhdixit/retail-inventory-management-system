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
          <p className="text-shop-highlight">Your cart is empty.</p>
        ) : (
          <>
            <div className="bg-shop-card rounded-2xl shadow-sm divide-y divide-shop-highlight/10 max-w-2xl">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center p-4">
                  <div>
                    <p className="font-medium text-shop-text">{item.product.name}</p>
                    <p className="text-sm text-shop-highlight">
                      ₹{item.product.price} each
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-shop-highlight/20 rounded-full overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="px-3 py-1 text-lg text-shop-text hover:bg-shop-bg transition"
                      >
                        −
                      </button>
                      <span className="px-4 font-mono text-sm text-shop-text">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="px-3 py-1 text-lg text-shop-text hover:bg-shop-bg transition"
                      >
                        +
                      </button>
                    </div>

                    <p className="w-20 text-right font-mono font-semibold text-shop-text">
                      ₹{(item.product.price * item.quantity).toFixed(2)}
                    </p>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-shop-error text-sm hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
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