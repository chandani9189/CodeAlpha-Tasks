import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTwitter, faPinterest, faCcVisa, faCcMastercard, faCcPaypal, faCcAmex } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-1.5 text-xl font-bold">
            <div className="bg-green-600 text-white p-1.5 rounded-md">
              <FontAwesomeIcon icon={faShoppingCart} className="text-xs" />
            </div>
            <span className="text-gray-900">Shop</span>
            <span className="text-green-600">Ease</span>
          </Link>
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            Your one-stop destination for trendy fashion and lifestyle products.
          </p>
          <div className="flex gap-3 mt-4 text-gray-400 text-lg">
            <a href="#" className="hover:text-green-600 transition"><FontAwesomeIcon icon={faFacebook} /></a>
            <a href="#" className="hover:text-green-600 transition"><FontAwesomeIcon icon={faInstagram} /></a>
            <a href="#" className="hover:text-green-600 transition"><FontAwesomeIcon icon={faTwitter} /></a>
            <a href="#" className="hover:text-green-600 transition"><FontAwesomeIcon icon={faPinterest} /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-sm text-gray-500">
            {[['/', 'Home'], ['/men', 'Men'], ['/women', 'Women'], ['/wishlist', 'Wishlist'], ['/cart', 'Cart']].map(([path, label]) => (
              <li key={path}><Link to={path} className="hover:text-green-600 transition">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Customer Service</h4>
          <ul className="space-y-2.5 text-sm text-gray-500">
            {['Help & Support', 'Track Order', 'Returns & Refunds', 'Shipping Policy', 'Terms & Conditions'].map((item) => (
              <li key={item}><a href="#" className="hover:text-green-600 transition">{item}</a></li>
            ))}
          </ul>
        </div>

        {/* Information */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Information</h4>
          <ul className="space-y-2.5 text-sm text-gray-500">
            {['About Us', 'Privacy Policy', "FAQ's", 'Contact Us'].map((item) => (
              <li key={item}><a href="#" className="hover:text-green-600 transition">{item}</a></li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Subscribe to our newsletter</h4>
          <p className="text-sm text-gray-500 mb-3 leading-relaxed">
            Get the latest updates on new arrivals, exclusive offers and more.
          </p>
          <div className="flex w-full">
            <input
              type="email"
              placeholder="Enter your email"
              className="min-w-0 flex-1 border border-gray-300 rounded-l-lg px-3 py-2 text-sm outline-none focus:border-green-500"
            />
            <button className="bg-green-600 text-white px-4 py-2 rounded-r-lg text-sm hover:bg-green-700 transition flex-shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row gap-3 justify-between items-center text-center sm:text-left">
        <p className="text-sm text-gray-500">© 2024 ShopEase. All rights reserved.</p>
        {/* Font Awesome payment icons */}
        <div className="flex items-center gap-3 text-3xl sm:text-4xl">
          <FontAwesomeIcon icon={faCcVisa} className="text-blue-700" />
          <FontAwesomeIcon icon={faCcMastercard} className="text-red-500" />
          <FontAwesomeIcon icon={faCcAmex} className="text-blue-500" />
          <FontAwesomeIcon icon={faCcPaypal} className="text-blue-600" />
        </div>
      </div>
    </footer>
  );
}
