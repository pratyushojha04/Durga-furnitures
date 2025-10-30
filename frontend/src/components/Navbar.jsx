import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Info, LogIn, LogOut, Mail, Menu, ShoppingCart, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    // Cart is saved in localStorage per user, so it persists after logout
    setIsOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-dark-bg text-text-light shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Logo / Brand */}
        <Link to="/" className="text-xl sm:text-2xl font-bold">
          Durga Handicrafts
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6 text-base font-medium">
          <Link to="/about" className="hover:text-wood-accent transition-colors duration-200 flex items-center gap-2">
            <Info size={18} />
            About
          </Link>
          <Link to="/contact" className="hover:text-wood-accent transition-colors duration-200 flex items-center gap-2">
            <Mail size={18} />
            Contact
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-4 ml-4">
              <Link to="/profile" className="flex items-center gap-2 hover:text-wood-accent">
                <User size={18} />
                {user.name || 'Profile'}
              </Link>
              <Link to="/cart" className="flex items-center gap-2 hover:text-wood-accent">
                <ShoppingCart size={18} />
                Cart
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 hover:text-wood-accent"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-wood-accent hover:bg-wood-accent-dark text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2"
            >
              <LogIn size={18} />
              Login / Sign Up
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden focus:outline-none text-text-light"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-3 bg-gray-800">
          <Link
            to="/about"
            className="block text-text-light hover:text-wood-accent transition-colors duration-200 flex items-center gap-2 py-2"
            onClick={() => setIsOpen(false)}
          >
            <Info size={18} />
            About
          </Link>
          <Link
            to="/contact"
            className="block text-text-light hover:text-wood-accent transition-colors duration-200 flex items-center gap-2 py-2"
            onClick={() => setIsOpen(false)}
          >
            <Mail size={18} />
            Contact
          </Link>
          
          {user ? (
            <>
              <Link
                to="/profile"
                className="block text-text-light hover:text-wood-accent transition-colors duration-200 flex items-center gap-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                <User size={18} />
                {user.name || 'Profile'}
              </Link>
              <Link
                to="/cart"
                className="block text-text-light hover:text-wood-accent transition-colors duration-200 flex items-center gap-2 py-2"
                onClick={() => setIsOpen(false)}
              >
                <ShoppingCart size={18} />
                Cart
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left text-text-light hover:text-wood-accent transition-colors duration-200 flex items-center gap-2 py-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="block text-text-light hover:text-wood-accent transition-colors duration-200 flex items-center gap-2 py-2"
              onClick={() => setIsOpen(false)}
            >
              <LogIn size={18} />
              Login / Sign Up
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}