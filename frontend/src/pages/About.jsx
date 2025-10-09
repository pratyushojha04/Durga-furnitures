import Navbar from '../components/Navbar';

function About() {
  return (
    <div className="min-h-screen bg-dark-bg text-text-light font-sans">
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8">About Durga Handicrafts</h1>
        <div className="bg-gray-900 p-8 rounded-lg shadow-md border border-wood-accent space-y-6">
          <p className="text-lg">
            Welcome to Durga Handicrafts, where we blend timeless craftsmanship with modern design to create pieces that transform your house into a home. Our journey began over two decades ago with a simple mission: to provide high-quality, durable, and beautiful furniture that stands the test of time.
          </p>
          <p className="text-lg">
            Each piece in our collection is crafted with care, using sustainably sourced materials and an unwavering attention to detail. From classic wooden designs to contemporary minimalist styles, we offer a wide range of furniture to suit every taste and space.
          </p>
          <p className="text-lg">
            At Durga Handicrafts, we believe that furniture is more than just functional; it's an expression of your personality and a cornerstone of your daily life. That's why we are committed to exceptional customer service and a seamless shopping experience, from browsing our collection to the final delivery.
          </p>
          <p className="text-lg">
            Thank you for choosing Durga Handicrafts. We look forward to helping you create a space you love.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
