import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-dark-bg py-8 px-4 text-text-light border-t border-gray-700">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Column 1: Logo and Copyright */}
        <div className="flex flex-col items-center md:items-start">
          <img src="/logo.png" alt="Durga Handicrafts Logo" className="h-12 mb-4" />
          <p className="text-sm text-gray-400">Crafting timeless furniture for your home.</p>
          <p className="text-sm text-gray-400 mt-4">&copy; 2025 Durga Handicrafts. All rights reserved.</p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Quick Links</h3>
          <div className="flex flex-col space-y-2 text-sm">
            <Link to="/about" className="hover:text-wood-accent transition-colors duration-200">
              About Us
            </Link>
            <a
              href="mailto:durgafurniture2412@gmail.com"
              className="hover:text-wood-accent transition-colors duration-200"
            >
              Contact
            </a>
          </div>
        </div>

        {/* Column 3: Contact Info */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
          <div className="text-sm text-gray-400 space-y-2">
            <p>Shahbery market, Greater Noida, UP, India</p>
            <p>Email: durgafurniture2412@gmail.com</p>
            <p>Phone: +91 9953578244</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;