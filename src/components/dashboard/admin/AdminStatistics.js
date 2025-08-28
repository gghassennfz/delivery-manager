import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Truck, Package, TrendingUp, Calendar } from 'lucide-react';

const AdminStatistics = ({ stats }) => {
  const { t } = useTranslation();
  
  const successRate = stats.totalDeliveries > 0 
    ? ((stats.completedDeliveries / stats.totalDeliveries) * 100).toFixed(1)
    : 0;

  const statisticsCards = [
    {
      title: t('totalUsers'),
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: t('totalDeliveryGuys'),
      value: stats.totalDeliveryGuys,
      icon: Truck,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: t('totalDeliveries'),
      value: stats.totalDeliveries,
      icon: Package,
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: t('successRate'),
      value: `${successRate}%`,
      icon: TrendingUp,
      color: 'orange',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Statistics Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Key metrics and performance indicators
          </p>
        </div>
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <Calendar className="h-5 w-5" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statisticsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Delivery Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
              <span className="font-medium text-yellow-600">{stats.pendingDeliveries}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
              <span className="font-medium text-green-600">{stats.completedDeliveries}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Returned</span>
              <span className="font-medium text-red-600">{stats.returnedDeliveries}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Project Owners</span>
              <span className="font-medium text-blue-600">{stats.totalProjectOwners}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Delivery Guys</span>
              <span className="font-medium text-green-600">{stats.totalDeliveryGuys}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Users</span>
              <span className="font-medium text-purple-600">{stats.totalUsers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
              <span className="font-medium text-orange-600">{successRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Deliveries</span>
              <span className="font-medium text-blue-600">{stats.pendingDeliveries + (stats.totalDeliveries - stats.completedDeliveries - stats.returnedDeliveries - stats.pendingDeliveries)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Daily</span>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                {Math.round(stats.totalDeliveries / 30)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
