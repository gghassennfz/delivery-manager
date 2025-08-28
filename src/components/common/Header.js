import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Moon, Sun, Globe, LogOut, Settings } from 'lucide-react';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { isDarkMode, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'fr' : 'en');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img 
                src="/assests/logo.png" 
                alt="AlphaGo Logo" 
                className="h-10 w-10 mr-3"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                AlphaGo
              </h1>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              title={t('language')}
            >
              <Globe className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              title={isDarkMode ? t('lightMode') : t('darkMode')}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Settings */}
            <button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
              <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* User Info and Logout */}
            {currentUser && (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 transition-colors duration-200"
                  title={t('logout')}
                >
                  <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
