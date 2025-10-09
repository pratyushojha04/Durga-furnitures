import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-dark-bg py-8 px-4 text-text-light">
      <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <img src="/logo.png" alt="Durga Furniture Logo" className="h-12 mb-2" />
          <p className="text-sm text-gray-400">Crafting timeless furniture for your home.</p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 text-sm">
          <Link to="/about" className="hover:text-wood-accent transition-colors duration-200">
            About
          </Link>
          <a
            href="mailto:your@company.com"
            className="hover:text-wood-accent transition-colors duration-200"
          >
            Contact
          </a>
        </div>
        <div className="mt-4 md:mt-0 text-sm text-gray-400">
          <p>&copy; 2025 Durga Furniture. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;