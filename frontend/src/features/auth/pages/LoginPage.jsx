import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSelector } from 'react-redux';

const LoginPage = () => {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await handleLogin(formData);
    if (result) {
      navigate('/')
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white text-black antialiased selection:bg-gray-200">
      <main className="flex-grow flex w-full min-h-screen">
        {/* Left Side: Image */}
        <div className="hidden lg:block lg:w-1/2 relative bg-gray-100">
          <img
            alt="SNITCH Editorial Cover"
            className="absolute inset-0 w-full h-full object-cover"
            src="/editorial-cover.jpg"
          />
          {/* Logo overlay on image */}
          <div className="absolute top-12 left-12">
            <Link to="/" className="text-4xl font-bold tracking-tighter text-white mix-blend-difference">
              SNITCH
            </Link>
          </div>
        </div>

        {/* Right Side: Login Interface */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 py-12 relative">

          <div className="lg:hidden mb-12">
            <Link to="/" className="text-4xl font-bold tracking-tighter text-black">
              SNITCH
            </Link>
          </div>

          <div className="max-w-md w-full mx-auto lg:mx-0">
            <h2 className="text-3xl font-bold mb-3 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-gray-500 mb-8">
              Please enter your details to sign in.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 text-sm">
                {error}
              </div>
            )}

            <form className="flex flex-col gap-5" method="POST" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700" htmlFor="email">
                  Email
                </label>
                <input
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  id="email"
                  name="email"
                  placeholder="user@example.com"
                  required
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-sm font-medium text-gray-700" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors focus:outline-none"
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('password');
                      input.type = input.type === 'password' ? 'text' : 'password';
                    }}
                  >
                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mt-1 mb-2">
                <div className="flex items-center gap-2">
                  <input
                    className="w-4 h-4 border-gray-300 rounded-none text-black focus:ring-black cursor-pointer"
                    id="remember"
                    type="checkbox"
                    checked={formData.remember}
                    onChange={handleChange}
                  />
                  <label className="text-sm text-gray-600 cursor-pointer" htmlFor="remember">
                    Remember me
                  </label>
                </div>
                <a className="text-sm text-gray-500 hover:text-black underline-offset-4 hover:underline transition-colors" href="#forgot">
                  Forgot password?
                </a>
              </div>

              <button
                className="w-full py-4 bg-black text-white font-semibold flex items-center justify-center gap-2 hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? 'LOGGING IN...' : 'SIGN IN'}
              </button>

              <div className="relative flex items-center my-6">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-gray-400 uppercase tracking-widest">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <a
                href="http://localhost:3000/api/auth/google"
                className="w-full py-3.5 border border-gray-200 text-black font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Logo" className="w-5 h-5" />
                Continue with Google
              </a>
            </form>

            <div className="text-center mt-8 text-sm text-gray-500">
              Don't have an account?{' '}
              <Link className="font-semibold text-black hover:underline" to="/signup">
                Create account
              </Link>
            </div>

            <div className="mt-16 text-xs text-gray-400 flex justify-between items-center">
              <span>© 2026 SNITCH</span>
              <div className="flex gap-4">
                <a className="hover:text-gray-900 transition-colors" href="#help">Help</a>
                <a className="hover:text-gray-900 transition-colors" href="#terms">Terms</a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
