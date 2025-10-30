import { useState } from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import NavAuthenticated from '../components/NavAuthenticated';
import Navbar from '../components/Navbar';
import api from '../services/api';

function Contact() {
  const user = JSON.parse(localStorage.getItem('user'));
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/api/contact', formData);
      setSuccess(response.data.message);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Contact form error:', err);
      setError(err.response?.data?.detail || 'Failed to send message. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-text-light">
      {user ? <NavAuthenticated /> : <Navbar />}
      
      <div className="max-w-screen-xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-wood-accent">
            Contact Us
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Have questions about our furniture? We're here to help! Reach out to us through any of the following methods.
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Phone */}
          <div className="bg-gray-900 p-6 rounded-lg border border-wood-accent hover:border-wood-accent/80 transition-all duration-300 hover:shadow-lg hover:shadow-wood-accent/20">
            <div className="flex flex-col items-center text-center">
              <div className="bg-wood-accent/10 p-4 rounded-full mb-4">
                <Phone className="text-wood-accent" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Phone</h3>
              <a 
                href="tel:+919953578244" 
                className="text-wood-accent hover:underline text-lg font-medium"
              >
                +91 9953578244
              </a>
              <p className="text-gray-400 text-sm mt-2">
                Call us for immediate assistance
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="bg-gray-900 p-6 rounded-lg border border-wood-accent hover:border-wood-accent/80 transition-all duration-300 hover:shadow-lg hover:shadow-wood-accent/20">
            <div className="flex flex-col items-center text-center">
              <div className="bg-wood-accent/10 p-4 rounded-full mb-4">
                <Mail className="text-wood-accent" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email</h3>
              <a 
                href="mailto:durgafurniture2412@gmail.com" 
                className="text-wood-accent hover:underline break-all"
              >
                durgafurniture2412@gmail.com
              </a>
              <p className="text-gray-400 text-sm mt-2">
                Send us an email anytime
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-900 p-6 rounded-lg border border-wood-accent hover:border-wood-accent/80 transition-all duration-300 hover:shadow-lg hover:shadow-wood-accent/20">
            <div className="flex flex-col items-center text-center">
              <div className="bg-wood-accent/10 p-4 rounded-full mb-4">
                <MapPin className="text-wood-accent" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Location</h3>
              <p className="text-gray-300">
                Shahbery Market
              </p>
              <p className="text-gray-300">
                Greater Noida, UP
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Visit our showroom
              </p>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-gray-900 p-6 rounded-lg border border-wood-accent hover:border-wood-accent/80 transition-all duration-300 hover:shadow-lg hover:shadow-wood-accent/20">
            <div className="flex flex-col items-center text-center">
              <div className="bg-wood-accent/10 p-4 rounded-full mb-4">
                <Clock className="text-wood-accent" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Business Hours</h3>
              <p className="text-gray-300">Mon - Sat</p>
              <p className="text-gray-300">9:00 AM - 7:00 PM</p>
              <p className="text-gray-400 text-sm mt-2">
                Sunday closed
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-3xl mx-auto bg-gray-900 p-8 rounded-lg border border-wood-accent">
          <h2 className="text-2xl font-bold mb-6 text-center">Send us a Message</h2>
          
          {/* Success Message */}
          {success && (
            <div className="bg-green-600 text-white p-4 rounded-lg mb-6 text-center">
              {success}
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6 text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-800 text-text-light border border-wood-accent focus:outline-none focus:ring-2 focus:ring-wood-accent"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 rounded-lg bg-gray-800 text-text-light border border-wood-accent focus:outline-none focus:ring-2 focus:ring-wood-accent"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-800 text-text-light border border-wood-accent focus:outline-none focus:ring-2 focus:ring-wood-accent"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-800 text-text-light border border-wood-accent focus:outline-none focus:ring-2 focus:ring-wood-accent"
                placeholder="Product Inquiry"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <textarea
                id="message"
                rows="6"
                value={formData.message}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-gray-800 text-text-light border border-wood-accent focus:outline-none focus:ring-2 focus:ring-wood-accent resize-none"
                placeholder="Tell us about your furniture needs..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                loading
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-wood-accent text-dark-bg hover:bg-opacity-80'
              }`}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-gray-400">
            For urgent inquiries, please call us directly at{' '}
            <a href="tel:+919953578244" className="text-wood-accent hover:underline font-semibold">
              +91 9953578244
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Contact;
