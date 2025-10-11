import { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Package, Calendar } from 'lucide-react';
import NavAuthenticated from '../components/NavAuthenticated';
import api from '../services/api';

function Profile() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Get user from localStorage
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);

    // Fetch user's orders
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'purchased':
        return 'bg-yellow-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'purchased':
        return 'Pending';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <>
        <NavAuthenticated />
        <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg flex items-center justify-center">
          <div className="text-text-light text-xl">Loading...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavAuthenticated />
      <div className="min-h-screen bg-gradient-to-br from-dark-bg via-gray-900 to-dark-bg py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* User Info Card */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
            <h1 className="text-3xl font-bold text-wood-accent mb-6 flex items-center gap-2">
              <User size={32} />
              My Profile
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="flex items-center gap-3 text-text-light">
                <User className="text-wood-accent" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Name</p>
                  <p className="text-lg font-semibold">{user?.name || 'N/A'}</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3 text-text-light">
                <Mail className="text-wood-accent" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-lg font-semibold">{user?.email || 'N/A'}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 text-text-light">
                <Phone className="text-wood-accent" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Phone Number</p>
                  <p className="text-lg font-semibold">{user?.phone_number || 'Not provided'}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-3 text-text-light">
                <Shield className="text-wood-accent" size={24} />
                <div>
                  <p className="text-sm text-gray-400">Role</p>
                  <p className="text-lg font-semibold capitalize">
                    {user?.role || 'User'}
                    {user?.role === 'admin' && (
                      <span className="ml-2 text-xs bg-wood-accent text-dark-bg px-2 py-1 rounded">
                        ADMIN
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Section */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-wood-accent mb-6 flex items-center gap-2">
              <Package size={28} />
              My Orders ({orders.length})
            </h2>

            {error && (
              <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
                {error}
              </div>
            )}

            {orders.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-xl">No orders yet</p>
                <p className="text-sm mt-2">Start shopping to see your orders here!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Product Image */}
                      {order.product_image && (
                        <div className="w-full md:w-32 h-32 flex-shrink-0">
                          <img
                            src={order.product_image}
                            alt={order.product_name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* Order Details */}
                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2 mb-3">
                          <div>
                            <h3 className="text-xl font-semibold text-text-light">
                              {order.product_name || 'Product'}
                            </h3>
                            <p className="text-gray-400 text-sm">Order ID: {order._id}</p>
                          </div>
                          <span
                            className={`${getStatusColor(
                              order.status
                            )} text-white px-4 py-1 rounded-full text-sm font-semibold self-start`}
                          >
                            {getStatusText(order.status)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-text-light">
                          <div>
                            <p className="text-sm text-gray-400">Quantity</p>
                            <p className="font-semibold">{order.quantity}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Price per item</p>
                            <p className="font-semibold">₹{order.product_price?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Total</p>
                            <p className="font-semibold text-wood-accent">
                              ₹{(order.product_price * order.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {order.phone_number && (
                          <div className="mt-3 text-sm text-gray-400">
                            <Phone size={14} className="inline mr-1" />
                            Contact: {order.phone_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Statistics */}
          {orders.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-400 text-sm mb-2">Total Orders</p>
                <p className="text-3xl font-bold text-wood-accent">{orders.length}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-400 text-sm mb-2">Pending Orders</p>
                <p className="text-3xl font-bold text-yellow-500">
                  {orders.filter((o) => o.status === 'purchased').length}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <p className="text-gray-400 text-sm mb-2">Total Spent</p>
                <p className="text-3xl font-bold text-green-500">
                  ₹
                  {orders
                    .reduce((sum, order) => sum + order.product_price * order.quantity, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Profile;
