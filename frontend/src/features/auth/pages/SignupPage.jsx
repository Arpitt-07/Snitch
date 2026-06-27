import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useSelector } from 'react-redux';

const SignupPage = () => {
  const { handleRegister } = useAuth();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
  });
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await handleRegister({
      email: formData.email,
      username: formData.username,
      password: formData.password,
    });
    if (result) {
      navigate('/')
    }

  };

  return (
    <div className="min-h-screen flex font-sans bg-white text-black antialiased selection:bg-gray-200">
      <main className="flex min-h-screen w-full flex-col md:flex-row">
        {/* Left Side: Image Canvas */}
        <section className="hidden md:block md:w-1/2 relative bg-gray-100">
          <img
            className="absolute inset-0 w-full h-full object-cover"
            alt="Premium minimalist fashion shot"
            src="/download (1).jpg"
          />
          {/* Logo overlay on image */}
          <div className="absolute top-12 left-12 z-10">
            <Link to="/" className="text-4xl font-bold tracking-tighter text-white mix-blend-difference">
              SNITCH
            </Link>
          </div>
        </section>

        {/* Right Side: Form Canvas */}
        <section className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 py-12 relative">

          <div className="md:hidden mb-12">
            <Link to="/" className="text-4xl font-bold tracking-tighter text-black">
              SNITCH
            </Link>
          </div>

          <div className="w-full max-w-md mx-auto lg:mx-0 flex flex-col gap-3 mb-10">
            <h2 className="text-3xl font-bold tracking-tight">Create an Account</h2>
            <p className="text-gray-500">Sign up to access exclusive drops and manage your orders.</p>
          </div>

          {error && (
            <div className="w-full max-w-md mx-auto lg:mx-0 mb-6 p-4 bg-red-50 text-red-600 border border-red-200 text-sm">
              {error}
            </div>
          )}

          <form className="w-full max-w-md mx-auto lg:mx-0 flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Input: Username */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="username">
                Username
              </label>
              <input
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                id="username"
                placeholder="johndoe"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            {/* Input: Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">
                Email Address
              </label>
              <input
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                id="email"
                placeholder="user@example.com"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {/* Input: Password */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  aria-label="Toggle password visibility"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>
            {/* Primary CTA */}
            <button
              className="mt-2 w-full bg-black text-white py-4 font-semibold hover:bg-gray-900 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
            </button>
          </form>

          <div className="w-full max-w-md mx-auto lg:mx-0 mt-8 flex flex-col gap-5">
            {/* Separator */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-xs font-semibold text-gray-400 uppercase tracking-widest">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            {/* Google Auth Action */}
            <a
              href="http://localhost:3000/api/auth/google"
              className="w-full bg-white border border-gray-200 text-black py-3.5 flex justify-center items-center gap-3 hover:bg-gray-50 transition-colors duration-300 font-medium"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Logo" className="w-5 h-5" />
              Continue with Google
            </a>

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link className="font-semibold text-black hover:underline ml-1" to="/login">Sign In</Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SignupPage;
