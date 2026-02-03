import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building,
  MapPin,
  Users,
  ArrowRight,
} from 'lucide-react';
import { FaGoogle, FaGithub, FaLinkedinIn } from 'react-icons/fa';
import axios from '../api';
import { useTheme } from '../context/ThemeContext';

// ✅ Define a type for the form
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student' | 'Working professional';
  company: string;
  location: string;
}

const SignUp: React.FC = () => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    company: '',
    location: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Handle OAuth Redirect Callback from Backend
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const userId = params.get('userId');

    if (token && userId) {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      navigate('/profile');
    }
  }, [location, navigate]);

  // ✅ Make handleChange generic
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Fix Axios typing
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role.toLowerCase(),
        company: formData.role === 'Working professional' ? formData.company : null,
        location: formData.role === 'Working professional' ? formData.location : null,
      });

      console.log('Registration successful:', response.data);
      setShowCoinAnimation(true);
      setTimeout(() => {
        setShowCoinAnimation(false);
        navigate('/login');
      }, 4000); // Wait 4 seconds for animation to complete

    } catch (error: any) {
      console.error('Registration failed:', error.response?.data?.message || error.message);
      setErrorMessage(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = (provider: 'google' | 'github' | 'linkedin') => {
    setIsLoading(true);
    // Redirect to backend social login initiation route
    const backendUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    window.location.href = `${backendUrl}/api/auth/social/${provider}`;
  };

  const coinVariants: any = {
    hidden: { opacity: 0, scale: 0.5, y: 0, rotate: 0 },
    visible: {
      opacity: 1,
      scale: [1, 1.2, 1],
      y: [0, -20, 0],
      rotate: [0, 360],
      transition: {
        type: 'tween',
        duration: 0.8,
        ease: 'easeInOut',
      },
    },
    burst: (i: number) => ({
      opacity: [1, 0],
      scale: [1, 2],
      y: [0, Math.random() * -150 - 50],
      x: [0, Math.random() * 100 - 50],
      rotate: [0, Math.random() * 720 - 360],
      transition: {
        duration: 0.8,
        ease: 'easeOut',
        delay: i * 0.05,
      },
    }),
  };

  return (
    // Background: Changed to Blue-50/Indigo-50 (consistent with Login)
    <div className={`min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 relative transition-colors duration-300 ${theme === 'dark'
      ? 'bg-transparent'
      : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
      }`}>
      {theme === 'dark' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-[100px]" />
        </div>
      )}
      <AnimatePresence>
        {showCoinAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`relative p-8 rounded-2xl shadow-2xl flex flex-col items-center justify-center text-center max-w-sm mx-auto ${theme === 'dark'
                ? 'bg-space-900 border border-white/10'
                : 'bg-white'
                }`}
            >
              <h3 className={`text-3xl font-bold mb-4 ${theme === 'dark' ? 'text-brand-cyan' : 'text-blue-600'}`}>Signup Bonus!</h3>
              <div className={`text-4xl font-extrabold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {/* Coin Text: Changed to Blue-600/Indigo-600 for consistency */}
                <span className={`text-6xl font-extrabold bg-clip-text text-transparent ${theme === 'dark'
                  ? 'bg-gradient-to-r from-brand-cyan to-brand-blue'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                  }`}>50</span> Coins
              </div>
              <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Welcome! Your bonus coins have been added to your profile.
              </p>

              {/* Coin Particles Animation (✨ kept as a universal icon) */}
              {[...Array(25)].map((_, i) => (
                <motion.span
                  key={i}
                  variants={coinVariants}
                  initial="hidden"
                  animate="visible"
                  exit="burst"
                  custom={i}
                  className="absolute text-3xl"
                  style={{
                    top: '50%',
                    left: '50%',
                    filter: `drop-shadow(0 0 5px rgba(100,200,255,0.8))`,
                  }}
                >
                  ✨
                </motion.span>
              ))}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className={`rounded-2xl shadow-2xl p-8 border ${theme === 'dark'
            ? 'glass border-white/10'
            : 'bg-white border-gray-100'
            }`}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20"
            >
              <Users className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Join X SHARE</h1>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Create your account and start connecting</p>
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSocialSignUp('google')}
              className={`flex items-center justify-center p-3 rounded-xl border transition-all duration-200 ${theme === 'dark'
                ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
            >
              <FaGoogle className="w-5 h-5 text-red-500" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSocialSignUp('linkedin')}
              className={`flex items-center justify-center p-3 rounded-xl border transition-all duration-200 ${theme === 'dark'
                ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
            >
              <FaLinkedinIn className="w-5 h-5 text-blue-600" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSocialSignUp('github')}
              className={`flex items-center justify-center p-3 rounded-xl border transition-all duration-200 ${theme === 'dark'
                ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white'
                : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
            >
              <FaGithub className="w-5 h-5 text-gray-900 dark:text-white" />
            </motion.button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${theme === 'dark' ? 'border-white/10' : 'border-gray-200'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-4 ${theme === 'dark' ? 'bg-[#121214] text-gray-400' : 'bg-white text-gray-500'}`}>Or sign up with email</span>
            </div>
          </div>

          {/* Role Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-6"
          >
            <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              I am a
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(['student', 'Working professional'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, role }))}
                  className={`p-4 border-2 rounded-xl font-medium transition-all duration-300 ${formData.role === role
                    ? (theme === 'dark' ? 'border-brand-cyan bg-brand-cyan/20 text-brand-cyan shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'border-blue-500 bg-blue-50 text-blue-600 shadow-md')
                    : (theme === 'dark' ? 'border-white/5 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20' : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50/30')
                    }`}
                >
                  <div className="capitalize font-bold">{role}</div>
                  <div className={`text-xs mt-1 font-medium ${theme === 'dark' ? 'opacity-60' : 'opacity-70'}`}>
                    {role === 'student'
                      ? 'Looking for guidance'
                      : 'Ready to mentor'}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div
                className="bg-red-500/10 border-l-4 border-red-500 text-red-500 p-4 rounded-lg flex items-center space-x-2"
                role="alert"
              >
                <p className="text-sm font-medium">{errorMessage}</p>
              </div>
            )}

            {/* Full Name */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Full Name
              </label>
              <div className="relative group">
                <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 w-5 h-5 ${theme === 'dark' ? 'text-gray-500 group-focus-within:text-brand-cyan' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-brand-cyan/50 focus:border-brand-cyan'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500'
                    }`}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 w-5 h-5 ${theme === 'dark' ? 'text-gray-500 group-focus-within:text-brand-cyan' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-brand-cyan/50 focus:border-brand-cyan'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500'
                    }`}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </motion.div>

            {/* Company + Location (for Working professionals only) */}
            {formData.role === 'Working professional' && (
              <>
                {/* Company */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Company
                  </label>
                  <div className="relative group">
                    <Building className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 w-5 h-5 ${theme === 'dark' ? 'text-gray-500 group-focus-within:text-brand-cyan' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-brand-cyan/50 focus:border-brand-cyan'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500'
                        }`}
                      placeholder="Your current company"
                      required
                    />
                  </div>
                </motion.div>

                {/* Location */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                >
                  <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location
                  </label>
                  <div className="relative group">
                    <MapPin className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 w-5 h-5 ${theme === 'dark' ? 'text-gray-500 group-focus-within:text-brand-cyan' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${theme === 'dark'
                        ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-brand-cyan/50 focus:border-brand-cyan'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500'
                        }`}
                      placeholder="Your city"
                      required
                    />
                  </div>
                </motion.div>
              </>
            )}

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 w-5 h-5 ${theme === 'dark' ? 'text-gray-500 group-focus-within:text-brand-cyan' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-brand-cyan/50 focus:border-brand-cyan'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500'
                    }`}
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Confirm Password */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200 w-5 h-5 ${theme === 'dark' ? 'text-gray-500 group-focus-within:text-brand-cyan' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-brand-cyan/50 focus:border-brand-cyan'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500'
                    }`}
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* Terms Checkbox */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <label className="flex items-start space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className={`w-4 h-4 rounded mt-1 transition-colors duration-200 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-brand-cyan focus:ring-brand-cyan/50' : 'text-blue-600 border-gray-300 focus:ring-blue-500'}`}
                  required
                />
                <span className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-900'}`}>
                  I agree to the{' '}
                  <Link
                    to="#"
                    className={`font-bold ${theme === 'dark' ? 'text-brand-cyan hover:underline' : 'text-blue-600 hover:underline'}`}
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="#"
                    className={`font-bold ${theme === 'dark' ? 'text-brand-cyan hover:underline' : 'text-blue-600 hover:underline'}`}
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center px-6 py-3 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${theme === 'dark'
                ? 'bg-gradient-to-r from-brand-cyan to-brand-blue hover:from-brand-cyan hover:to-brand-purple'
                : 'bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500'
                }`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </motion.button>
          </form>

          {/* Sign In Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-8 text-center border-t pt-6 border-gray-100 dark:border-white/5"
          >
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-500' : 'text-gray-600'}`}>
              Already have an account?{' '}
              <Link
                to="/login"
                className={`font-bold ${theme === 'dark' ? 'text-brand-cyan hover:underline' : 'text-blue-600 hover:underline'}`}
              >
                Sign in here
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignUp;