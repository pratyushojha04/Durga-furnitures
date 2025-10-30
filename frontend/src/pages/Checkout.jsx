// import { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useCart } from '../context/CartContext'; // Assuming CartContext from prior responses
// import api from '../services/api';

// function Checkout() {
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { cart, setCart } = useCart();
//   const cartData = location.state?.cart || cart; // Fallback to context cart

//   const handlePlaceOrder = async () => {
//     if (loading) return; // Prevent multiple submissions
//     setLoading(true);
//     setError('');
//     setSuccess('');
//     try {
//       if (cartData.length === 0) {
//         throw new Error('Cart is empty.');
//       }
//       const orderRequest = {
//         items: cartData.map(item => ({
//           product_id: item.product_id,
//           quantity: item.quantity,
//         })),
//       };
//       await api.post('/orders', orderRequest);
//       setSuccess('Order placed successfully!');
//       setCart([]); // Clear cart
//       setTimeout(() => {
//         navigate('/dashboard');
//       }, 2000);
//     } catch (err) {
//       const errorMessage = Array.isArray(err.response?.data)
//         ? err.response.data.map(e => e.msg).join('; ')
//         : err.response?.data?.detail || err.message || 'Failed to place order. Please try again.';
//       setError(errorMessage);
//       setTimeout(() => setLoading(false), 3000);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-dark-bg text-text-light px-4 py-6 font-sans">
//       <div className="max-w-4xl mx-auto">
//         <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">Checkout</h2>
//         {error && (
//           <div className="bg-red-600 text-white p-4 rounded-lg mb-6 text-center text-sm sm:text-base">
//             {error}
//             <button
//               onClick={() => setError('')}
//               className="ml-4 text-xs sm:text-sm underline"
//             >
//               Dismiss
//             </button>
//           </div>
//         )}
//         {success && (
//           <div className="bg-green-600 text-white p-4 rounded-lg mb-6 text-center text-sm sm:text-base">
//             {success}
//             <button
//               onClick={() => setSuccess('')}
//               className="ml-4 text-xs sm:text-sm underline"
//             >
//               Dismiss
//             </button>
//           </div>
//         )}
//         <div className="bg-gray-900 p-4 sm:p-6 rounded-lg shadow-md border border-wood-accent">
//           <h3 className="text-lg sm:text-xl font-semibold mb-4">Order Summary</h3>
//           {cartData.length === 0 ? (
//             <p className="text-center text-sm sm:text-base">No items in cart.</p>
//           ) : (
//             <div className="space-y-4">
//               {cartData.map(item => (
//                 <div
//                   key={item.product_id}
//                   className="p-4 bg-gray-800 rounded-lg border border-wood-accent flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
//                 >
//                   <div>
//                     <h4 className="text-base sm:text-md font-semibold">{item.name}</h4>
//                     <p className="text-sm text-gray-400">Price: ${item.price.toFixed(2)}</p>
//                     <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
//                   </div>
//                   <p className="text-sm sm:text-base font-semibold">
//                     Subtotal: ${(item.price * item.quantity).toFixed(2)}
//                   </p>
//                 </div>
//               ))}
//               <p className="text-base sm:text-lg font-semibold text-right">
//                 Total: ₹{cartData.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
//               </p>
//               <button
//                 onClick={handlePlaceOrder}
//                 disabled={loading || cartData.length === 0}
//                 className={`w-full py-3 rounded-lg font-semibold transition-colors duration-200 mt-4 ${
//                   loading || cartData.length === 0
//                     ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
//                     : 'bg-wood-accent text-dark-bg hover:bg-opacity-80'
//                 }`}
//               >
//                 {loading ? 'Processing...' : 'Place Order'}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Checkout;

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import NavAuthenticated from '../components/NavAuthenticated';
import PhoneNumberModal from '../components/PhoneNumberModal';

function Checkout() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [localCart, setLocalCart] = useState([]);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const { cart, setCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize local cart from location.state or context (only once on mount)
  useEffect(() => {
    const validateAndInitializeCart = async () => {
      const initialCart = location.state?.cart || cart;
      console.log('=== CHECKOUT INITIALIZED ===');
      console.log('Cart items:', initialCart.length);
      console.log('Cart contents:', initialCart);
      
      if (initialCart.length === 0) {
        setLocalCart([]);
        return;
      }

      try {
        // Fetch current stock levels for all cart items
        const productIds = initialCart.map(item => item.product_id);
        // Temporarily disabled until backend is redeployed with the new endpoint
        // const response = await api.post('/api/products/validate-cart', productIds);
        // const currentProducts = response.data;
        
        // For now, just use the cart as-is without validation
        setLocalCart(initialCart);
        return;
        
        // Create a map of product_id to current stock
        const stockMap = {};
        currentProducts.forEach(product => {
          stockMap[product._id] = product.stock;
        });
        
        // Validate and adjust cart items
        const validatedCart = [];
        const removedItems = [];
        const adjustedItems = [];
        
        initialCart.forEach(item => {
          const currentStock = stockMap[item.product_id];
          
          if (currentStock === undefined) {
            // Product no longer exists
            removedItems.push(`${item.name} (no longer available)`);
          } else if (currentStock === 0) {
            // Product out of stock
            removedItems.push(`${item.name} (out of stock)`);
          } else if (currentStock < item.quantity) {
            // Adjust quantity to available stock
            adjustedItems.push(`${item.name} (quantity adjusted from ${item.quantity} to ${currentStock})`);
            validatedCart.push({ ...item, quantity: currentStock });
          } else {
            // Item is valid
            validatedCart.push(item);
          }
        });
        
        // Show warnings if items were removed or adjusted
        if (removedItems.length > 0 || adjustedItems.length > 0) {
          let warningMsg = '';
          if (removedItems.length > 0) {
            warningMsg += 'The following items were removed from your cart:\n• ' + removedItems.join('\n• ');
          }
          if (adjustedItems.length > 0) {
            if (warningMsg) warningMsg += '\n\n';
            warningMsg += 'The following items had their quantities adjusted:\n• ' + adjustedItems.join('\n• ');
          }
          setError(warningMsg);
          setTimeout(() => setError(''), 10000);
        }
        
        setLocalCart(validatedCart);
        setCart(validatedCart); // Update context cart as well
        
        console.log('Cart validated. Valid items:', validatedCart.length);
      } catch (err) {
        console.error('Error validating cart:', err);
        // If validation fails, still show the cart but warn the user
        setLocalCart(initialCart);
        setError('Unable to verify stock levels. Some items may be unavailable.');
        setTimeout(() => setError(''), 5000);
      }
    };
    
    validateAndInitializeCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleQuantityChange = (productId, change) => {
    setLocalCart(prevCart => 
      prevCart.map(item => {
        if (item.product_id === productId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      })
    );
    // Also update context cart
    setCart(prevCart => 
      prevCart.map(item => {
        if (item.product_id === productId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (productId) => {
    setLocalCart(prevCart => prevCart.filter(item => item.product_id !== productId));
    setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
  };

  const handlePlaceOrder = async () => {
    // Check if user has phone number
    if (!user?.phone_number && !user?.phone) {
      setShowPhoneModal(true);
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (localCart.length === 0) {
        throw new Error('Cart is empty.');
      }
      
      const orderRequest = {
        items: localCart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
      };
      
      console.log('=== PLACING ORDER ===');
      console.log('Order request:', JSON.stringify(orderRequest, null, 2));
      console.log('Number of items:', orderRequest.items.length);
      
      const response = await api.post('/api/orders', orderRequest);
      console.log('Order response:', response.data);
      setSuccess(response.data.message || 'Order placed successfully!');
      setCart([]);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('=== ORDER ERROR ===');
      console.error('Error:', err);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      
      if (err.response?.status === 400 && err.response.data?.unavailable) {
        // Handle new format: { message: string, unavailable: string[] }
        const unavailableList = err.response.data.unavailable;
        const unavailableMsg = unavailableList.join('\n• ');
        setError(`Some items are unavailable:\n• ${unavailableMsg}\n\nUnavailable items have been removed from your cart.`);
        
        // Extract product IDs from error messages and remove them from cart
        const unavailableIds = unavailableList.map(msg => {
          const match = msg.match(/Product ID ([a-zA-Z0-9]+)/);
          return match ? match[1] : null;
        }).filter(id => id);
        
        console.log('Unavailable product IDs:', unavailableIds);
        
        setLocalCart(prevCart => prevCart.filter(item => !unavailableIds.includes(item.product_id)));
        setCart(prevCart => prevCart.filter(item => !unavailableIds.includes(item.product_id)));
      } else {
        // Handle other error formats
        let errorMessage = 'Failed to place order. Please try again.';
        if (typeof err.response?.data?.detail === 'object' && err.response.data.detail?.message) {
          errorMessage = err.response.data.detail.message;
        } else if (typeof err.response?.data?.detail === 'string') {
          errorMessage = err.response.data.detail;
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (Array.isArray(err.response?.data)) {
          errorMessage = err.response.data.map(e => `${e.loc.join('.')}: ${e.msg}`).join('; ');
        } else if (err.message) {
          errorMessage = err.message;
        }
        setError(errorMessage);
      }
      setTimeout(() => setError(''), 10000);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSuccess = () => {
    setShowPhoneModal(false);
    // Automatically retry placing order after phone number is added
    handlePlaceOrder();
  };

  return (
    <div className="min-h-screen bg-dark-bg text-text-light px-4 py-6 font-sans">
      {showPhoneModal && <PhoneNumberModal onSuccess={handlePhoneSuccess} />}
      <NavAuthenticated />
      <div className="max-w-screen-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">Checkout</h2>
        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6 text-left text-sm sm:text-base">
            <div className="whitespace-pre-line">{error}</div>
            <button
              onClick={() => setError('')}
              className="mt-2 text-xs sm:text-sm underline block"
            >
              Dismiss
            </button>
          </div>
        )}
        {success && (
          <div className="bg-green-600 text-white p-4 rounded-lg mb-6 text-center text-sm sm:text-base">
            {success}
            <button
              onClick={() => setSuccess('')}
              className="ml-4 text-xs sm:text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="bg-gray-900 p-4 sm:p-6 rounded-lg shadow-md border border-wood-accent">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">Order Summary</h3>
          {localCart.length === 0 ? (
            <p className="text-center text-sm sm:text-base">No items in cart.</p>
          ) : (
            <div className="space-y-4">
              {localCart.map(item => (
                <div
                  key={item.product_id}
                  className="p-4 bg-gray-800 rounded-lg border border-wood-accent flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <img
                      src={item.image_url || '/fallback-image.jpg'}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-md"
                      onError={(e) => {
                        console.error(`Failed to load image: ${item.image_url || 'fallback'}`);
                        e.target.src = '/fallback-image.jpg';
                        e.target.onerror = null; // Prevent infinite retry loop
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="text-base sm:text-md font-semibold text-text-light">{item.name}</h4>
                      <p className="text-sm text-gray-400">Price: ₹{item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-sm text-gray-400">Quantity:</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleQuantityChange(item.product_id, -1)}
                            disabled={loading}
                            className="w-8 h-8 bg-wood-accent text-dark-bg rounded-md hover:bg-opacity-80 transition-colors font-bold disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="text-text-light font-semibold w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.product_id, 1)}
                            disabled={loading}
                            className="w-8 h-8 bg-wood-accent text-dark-bg rounded-md hover:bg-opacity-80 transition-colors font-bold disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                    <p className="text-sm sm:text-base font-semibold text-text-light">
                      Subtotal: ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleRemoveItem(item.product_id)}
                      disabled={loading}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <p className="text-base sm:text-lg font-semibold text-right text-text-light">
                Total: ₹{localCart.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}
              </p>
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-semibold transition-colors duration-200 mt-4 ${
                  loading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-wood-accent text-dark-bg hover:bg-opacity-80'
                }`}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Checkout;