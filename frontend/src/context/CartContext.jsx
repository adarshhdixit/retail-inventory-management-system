import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

function sameLine(item, productId, variantId) {
  const itemVariantId = item.variant?.id ?? null;
  return item.product.id === productId && itemVariantId === (variantId ?? null);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (product, quantity = 1, variant = null) => {
    const variantId = variant?.id ?? null;
    setCartItems((prev) => {
      const existing = prev.find((item) => sameLine(item, product.id, variantId));
      if (existing) {
        return prev.map((item) =>
          sameLine(item, product.id, variantId)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, variant }];
    });
  };

  const updateQuantity = (productId, variantId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        sameLine(item, productId, variantId) ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (productId, variantId) => {
    setCartItems((prev) => prev.filter((item) => !sameLine(item, productId, variantId)));
  };

  const clearCart = () => setCartItems([]);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}