import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../redux/slices/authSlice.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEnvelope, faLock, faEye, faEyeSlash, faShield, faShieldHalved } from '@fortawesome/free-solid-svg-icons';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRoles, setShowRoles] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    dispatch(clearError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword)
      return alert('Passwords do not match!');
    if (!agreed)
      return alert('Please agree to Terms & Conditions!');
    if (!form.role)
      return alert('Please select a role!');

    const result = await dispatch(registerUser({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    }));

    if (registerUser.fulfilled.match(result)) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Create Your Account</h2>
        <p className="text-gray-500 text-sm mb-6">Join ShopEase and start shopping your favorite products.</p>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-green-500">
              <FontAwesomeIcon icon={faUser} className="text-gray-400 mr-2" />
              <input type="text" name="name" placeholder="Enter your full name"
                value={form.name} onChange={handleChange}
                className="flex-1 outline-none text-sm text-gray-700" required />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Email Address</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-green-500">
              <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 mr-2" />
              <input type="email" name="email" placeholder="Enter your email address"
                value={form.email} onChange={handleChange}
                className="flex-1 outline-none text-sm text-gray-700" required />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-green-500">
              <FontAwesomeIcon icon={faLock} className="text-gray-400 mr-2" />
              <input type={showPass ? 'text' : 'password'} name="password"
                placeholder="Create a password" value={form.password} onChange={handleChange}
                className="flex-1 outline-none text-sm text-gray-700" required />
              <button type="button" onClick={() => setShowPass(!showPass)}>
                <FontAwesomeIcon icon={showPass ? faEyeSlash : faEye} className="text-gray-400" />
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Password must be at least 6 characters long</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm Password</label>
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-green-500">
              <FontAwesomeIcon icon={faLock} className="text-gray-400 mr-2" />
              <input type={showConfirm ? 'text' : 'password'} name="confirmPassword"
                placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange}
                className="flex-1 outline-none text-sm text-gray-700" required />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} className="text-gray-400" />
              </button>
            </div>
          </div>

          {/* Role */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Role</label>
            <button type="button" onClick={() => setShowRoles(!showRoles)}
              className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faShield} className="text-gray-400" />
                {form.role ? form.role.charAt(0).toUpperCase() + form.role.slice(1) : 'Select your role'}
              </div>
              <span>▾</span>
            </button>

            {showRoles && (
              <div className="border border-gray-200 rounded-lg mt-1 bg-white shadow-sm z-10 relative">
                <button type="button" onClick={() => { setForm({ ...form, role: 'user' }); setShowRoles(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faUser} className="text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">User</p>
                      <p className="text-xs text-gray-400">Can browse products, add to cart, place orders and manage profile.</p>
                    </div>
                  </div>
                </button>
                <button type="button" onClick={() => { setForm({ ...form, role: 'admin' }); setShowRoles(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 border-t">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faShield} className="text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Admin</p>
                      <p className="text-xs text-gray-400">Can access admin dashboard to manage products, orders and users.</p>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Terms */}
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)}
              className="accent-green-600" />
            I agree to the{' '}
            <span className="text-green-600 hover:underline cursor-pointer">Terms & Conditions</span>
            {' '}and{' '}
            <span className="text-green-600 hover:underline cursor-pointer">Privacy Policy</span>
          </label>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}