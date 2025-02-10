import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useRegisterMutation } from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FaBrain, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import Loader from '../components/Loader';
import { useTheme } from '../context/ThemeContext';

const RegisterScreen = () => {
  const { isDarkMode } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
    } else {
      try {
        const res = await register({ name, email, password, userType: 'student' }).unwrap();
        dispatch(setCredentials({ ...res }));
        navigate('/');
      } catch (err) {
        toast.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 relative ${
      isDarkMode ? 'bg-[#0A0F1C]' : 'bg-gray-50'
    }`}> q
      {/* Background Effects - Update z-index to ensure it stays behind the form */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${
          isDarkMode 
            ? 'from-violet-600/10 via-transparent to-indigo-600/10'
            : 'from-violet-600/5 via-transparent to-indigo-600/5'
        }`} />
        <div className={`absolute top-0 right-0 w-96 h-96 ${
          isDarkMode ? 'bg-violet-500/10' : 'bg-violet-500/5'
        } rounded-full filter blur-3xl animate-blob`} />
        <div className={`absolute bottom-0 left-0 w-96 h-96 ${
          isDarkMode ? 'bg-indigo-500/10' : 'bg-indigo-500/5'
        } rounded-full filter blur-3xl animate-blob animation-delay-2000`} />
      </div>

      {/* Add z-index to ensure form appears above background */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg">
              <FaBrain className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h2 className={`mt-6 text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Create Account
          </h2>
          <p className={isDarkMode ? 'mt-2 text-gray-400' : 'mt-2 text-gray-600'}>
            Join the future of education
          </p>
        </div>

        <div className="relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${
            isDarkMode 
              ? 'from-violet-600/20 to-indigo-600/20'
              : 'from-violet-600/10 to-indigo-600/10'
          } rounded-lg blur`} />
          <form 
            onSubmit={submitHandler} 
            className={`relative ${
              isDarkMode 
                ? 'bg-gray-900/50 border-gray-800' 
                : 'bg-white/50 border-gray-200'
            } backdrop-blur-xl p-8 rounded-lg shadow-xl space-y-6 border`}
          >
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className={`h-5 w-5 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      isDarkMode 
                        ? 'border-gray-700 bg-gray-800/50 text-white placeholder-gray-500' 
                        : 'border-gray-300 bg-white/50 text-gray-900 placeholder-gray-400'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className={`h-5 w-5 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      isDarkMode 
                        ? 'border-gray-700 bg-gray-800/50 text-white placeholder-gray-500' 
                        : 'border-gray-300 bg-white/50 text-gray-900 placeholder-gray-400'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className={`h-5 w-5 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      isDarkMode 
                        ? 'border-gray-700 bg-gray-800/50 text-white placeholder-gray-500' 
                        : 'border-gray-300 bg-white/50 text-gray-900 placeholder-gray-400'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className={`h-5 w-5 ${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    }`} />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      isDarkMode 
                        ? 'border-gray-700 bg-gray-800/50 text-white placeholder-gray-500' 
                        : 'border-gray-300 bg-white/50 text-gray-900 placeholder-gray-400'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent`}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 rounded-lg text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-150"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>
        </div>

        {isLoading && <Loader />}

        <div className="text-center">
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-violet-600 hover:text-violet-500 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterScreen;
