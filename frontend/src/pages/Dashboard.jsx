import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavAuthenticated from '../components/NavAuthenticated';
import { useCart } from '../context/CartContext';
import { Search, X } from 'lucide-react';
import api from '../services/api';

function Dashboard() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get('/api/products', {
          params: { limit: 100 } // Fetch more products for better search
        });
        setProducts(response.data);
        setFilteredProducts(response.data);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...new Set(response.data.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Products fetch error:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products based on search term and category
  useEffect(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => 
        product.category === selectedCategory
      );
    }

    // Filter by search term (name or category)
    if (searchTerm.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedCategory, products]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setSelectedCategory('All');
  };

  const handleAddToCart = (product) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      addToCart(product);
      // Show success feedback
      const successMsg = `${product.name} added to cart!`;
      setError(''); // Clear any existing errors
      
      // Optional: Show a temporary success message
      const tempDiv = document.createElement('div');
      tempDiv.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      tempDiv.textContent = successMsg;
      document.body.appendChild(tempDiv);
      
      setTimeout(() => {
        tempDiv.remove();
      }, 2000);
      
      console.log('Added to cart:', product);
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart. Please try again.');
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
        
        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by product name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-gray-800 border border-wood-accent rounded-lg text-text-light placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-wood-accent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-wood-accent transition"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                  selectedCategory === category
                    ? 'bg-wood-accent text-dark-bg font-semibold'
                    : 'bg-gray-800 text-text-light hover:bg-gray-700 border border-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Results Info */}
          <div className="flex justify-between items-center text-sm text-gray-400">
            <p>
              Showing {filteredProducts.length} of {products.length} products
              {(searchTerm || selectedCategory !== 'All') && (
                <button
                  onClick={handleClearSearch}
                  className="ml-3 text-wood-accent hover:underline"
                >
                  Clear filters
                </button>
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.length === 0 ? (
            <p className="text-center text-gray-400 col-span-full">
              {products.length === 0 ? 'No products available.' : 'No products match your search.'}
            </p>
          ) : (
            filteredProducts.map(product => (
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
    </div>
  );
}

export default Dashboard;
