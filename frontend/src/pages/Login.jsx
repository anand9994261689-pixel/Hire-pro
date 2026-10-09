import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle, Loader } from 'lucide-react';
import { loginUser, getMe } from '../services/api';
import { AppContext } from '../App';

const Login = () => {
  const navigate = useNavigate();
  const { setToken, setUser } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Invalid email address';
    }
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      const data = await loginUser(email, password);
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      
      // Fetch user details
      const userProfile = await getMe();
      setUser(userProfile);
      
      navigate('/');
    } catch (err) {
      console.error(err);
      setApiError(
        err.response?.data?.detail || 
        'Failed to login. Please check your credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 glass-panel p-10 rounded-3xl border border-gray-800"
      >
        <div>
          <h2 className="mt-2 text-center text-4xl font-extrabold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-3 text-center text-sm text-gray-400">
            Or{' '}
            <Link to="/register" className="font-semibold text-brand hover:text-brand-light transition-colors">
              create a new account
            </Link>
          </p>
        </div>

        {apiError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm"
          >
            <AlertCircle size={20} className="shrink-0" />
            <span>{apiError}</span>
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3 bg-surface/50 border ${
                    errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-gray-800 focus:border-brand'
                  } rounded-xl text-white placeholder-gray-500 focus:ring-1 focus:ring-brand outline-none transition-all`}
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3 bg-surface/50 border ${
                    errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-gray-800 focus:border-brand'
                  } rounded-xl text-white placeholder-gray-500 focus:ring-1 focus:ring-brand outline-none transition-all`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1 font-medium">
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-white bg-brand hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand font-semibold transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="animate-spin" size={18} />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
