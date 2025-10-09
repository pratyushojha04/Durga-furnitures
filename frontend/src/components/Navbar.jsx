import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-dark-bg text-text-light shadow-md">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Logo / Brand */}
        <Link to="/" className="text-xl sm:text-2xl font-bold">
          Durga Handicrafts
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 text-base font-medium">
          
          <Link to="/about" className="hover:text-wood-accent transition-colors duration-200">
            About
          </Link>
          <Link to="/login" className="hover:text-wood-accent transition-colors duration-200">
            Login
          </Link>
          <Link to="/contact" className="hover:text-wood-accent transition-colors duration-200">
            Contact
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-3 bg-gray-800">
          <Link
            to="/"
            className="block text-text-light hover:text-wood-accent transition-colors duration-200"
          >
            Shop
          </Link>
          <Link
            to="/about"
            className="block text-text-light hover:text-wood-accent transition-colors duration-200"
          >
            About
          </Link>
          <Link
            to="/login"
            className="block text-text-light hover:text-wood-accent transition-colors duration-200"
          >
            Login
          </Link>
          <Link
            to="/contact"
            className="block text-text-light hover:text-wood-accent transition-colors duration-200"
          >
            Contact
          </Link>
        </div>
      )}
    </nav>
  );
}