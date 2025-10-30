import { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

// Helper function to get cart key for current user
const getCartKey = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.email ? `cart_${user.email}` : 'cart_guest';
};

// Helper function to load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    console.error('Error loading cart from storage:', error);
    return [];
  }
};

// Helper function to save cart to localStorage
const saveCartToStorage = (cart) => {
  try {
    const cartKey = getCartKey();
    localStorage.setItem(cartKey, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to storage:', error);
  }
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCartFromStorage);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.product_id === product._id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product_id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          product_id: product._id,
          name: product.name,
          price: product.price,
          image_url: product.image_url,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (product_id) => {
    setCart((prevCart) => prevCart.filter(item => item.product_id !== product_id));
  };

  const updateQuantity = (product_id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(product_id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map(item =>
        item.product_id === product_id
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    // Also clear from localStorage
    const cartKey = getCartKey();
    localStorage.removeItem(cartKey);
  };

  // Function to reload cart from storage (useful after login)
  const reloadCart = () => {
    const loadedCart = loadCartFromStorage();
    setCart(loadedCart);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, reloadCart, setCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}