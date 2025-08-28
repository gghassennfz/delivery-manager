import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User } from 'lucide-react';
import Notification from '../common/Notification';
import AnimatedBackground from '../common/AnimatedBackground';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, signup, notification, clearNotification, currentUser, userRole } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (currentUser && userRole) {
      navigate('/', { replace: true });
    }
  }, [currentUser, userRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignup) {
        if (!role) {
          setError('Please select a role');
          setLoading(false);
          return;
        }
        await signup(email, password, role);
        // Wait a moment for auth state to update, then navigate
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      } else {
        await login(email, password);
        // Wait a moment for auth state to update, then navigate
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      }
    } catch (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  const roles = [
    { value: 'project-owner', label: t('projectOwner'), color: 'bg-blue-500' },
    { value: 'delivery-guy', label: t('deliveryGuy'), color: 'bg-green-500' },
    { value: 'admin', label: t('admin'), color: 'bg-purple-500' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative px-4">
      <AnimatedBackground />
      <Notification notification={notification} onClose={clearNotification} />
      <div className="max-w-md w-full space-y-8">
        <div className="animate-fade-in relative z-20">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/assests/logo.png" 
                alt="AlphaGo Logo" 
                className="h-16 w-16 mr-3 relative z-20"
                onError={(e) => {
                  console.log('Logo failed to load');
                  e.target.style.display = 'none';
                }}
              />
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white relative z-20">
                AlphaGo
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 relative z-20">
              {isSignup ? 'Create your account' : t('login')}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 relative z-10">
              {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('password')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {/* Role Selection - Only for Signup */}
                {isSignup && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('selectRole')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                        required
                      >
                        <option value="">{t('selectRole')}</option>
                        {roles.map((roleOption) => (
                          <option key={roleOption.value} value={roleOption.value}>
                            {roleOption.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  isSignup ? 'Sign Up' : t('login')
                )}
              </button>
            </div>

            <div className="text-center relative z-20">
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-200/50 dark:border-gray-700/50 transition-all duration-200 hover:bg-white/90 dark:hover:bg-gray-800/90"
              >
                {isSignup 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
