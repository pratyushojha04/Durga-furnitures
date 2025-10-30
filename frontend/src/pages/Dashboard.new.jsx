import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavAuthenticated from '../components/NavAuthenticated';
import PhoneNumberModal from '../components/PhoneNumberModal';
import api from '../services/api';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/products', {
          params: { limit: 12 } // Fetch first 12 products
        });
        setProducts(response.data);
      } catch (err) {
        console.error('Products fetch error:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }

    if (!user.phone_number) {
      setShowPhoneModal(true);
      return;
    }

    // Add to cart logic here
    console.log('Adding to cart:', product);
    // navigate('/cart');
  };

  const handlePhoneSubmit = async (phone_number) => {
    try {
      await api.post('/user/phone', { phone_number });
      const updatedUser = { ...JSON.parse(localStorage.getItem('user')), phone_number };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setShowPhoneModal(false);
    } catch (err) {
      console.error('Error updating phone number:', err);
      setError('Failed to update phone number. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg text-text-light px-4 py-6 font-sans">
        <NavAuthenticated />
        <div className="max-w-screen-xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wood-accent"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-bg text-text-light px-4 py-6 font-sans">
        <NavAuthenticated />
        <div className="max-w-screen-xl mx-auto">
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6 text-center">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-4 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg text-text-light px-4 py-6 font-sans">
      <NavAuthenticated />
      <div className="max-w-screen-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">Our Furniture</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.length === 0 ? (
            <p className="text-center text-gray-400 col-span-full">No products available.</p>
          ) : (
            products.map(product => (
              <div
                key={product._id}
                className="bg-gray-800 rounded-lg shadow-md border border-wood-accent p-4 hover:shadow-lg transition-shadow"
              >
                <img
                  src={product.image_url || '/fallback-image.jpg'}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                  onError={(e) => {
                    console.error(`Failed to load image: ${product.image_url}`);
                    e.target.src = '/fallback-image.jpg';
                  }}
                />
                <h3 className="text-lg font-semibold text-text-light">{product.name}</h3>
                <p className="text-gray-400 text-sm">{product.category || 'No category'}</p>
                <p className="text-text-light font-semibold mt-2">₹{product.price?.toFixed(2) || '0.00'}</p>
                <button
                  onClick={() => handleAddToCart(product)}
                  className="mt-4 w-full bg-wood-accent text-dark-bg py-2 rounded-lg hover:bg-opacity-80 transition"
                >
                  Add to Cart
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      {showPhoneModal && (
        <PhoneNumberModal
          isOpen={showPhoneModal}
          onClose={() => setShowPhoneModal(false)}
          onSubmit={handlePhoneSubmit}
        />
      )}
    </div>
  );
}

export default Dashboard;
