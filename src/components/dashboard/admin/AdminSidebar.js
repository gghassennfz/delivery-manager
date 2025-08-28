import React from 'react';
import { 
  BarChart3, 
  History, 
  Clock, 
  Settings, 
  Users,
  Package,
  TrendingUp
} from 'lucide-react';

const AdminSidebar = ({ activeView, setActiveView }) => {
  const menuItems = [
    {
      id: 'statistics',
      name: 'Statistics',
      icon: BarChart3,
      description: 'Overview & Stats'
    },
    {
      id: 'charts',
      name: 'Analytics',
      icon: TrendingUp,
      description: 'Charts & Trends'
    },
    {
      id: 'deliveries',
      name: 'All Deliveries',
      icon: Package,
      description: 'Manage & Assign'
    },
    {
      id: 'recent-deliveries',
      name: 'Recent',
      icon: Clock,
      description: 'Recent Deliveries'
    },
    {
      id: 'delivery-history',
      name: 'History',
      icon: History,
      description: 'Full History'
    },
    {
      id: 'delivery-guy-activities',
      name: 'Activities',
      icon: Users,
      description: 'Delivery Guy Activities'
    }
  ];

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md h-full border-r border-gray-200/50 dark:border-gray-700/50 shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Package className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Admin Panel
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Dashboard Control
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon 
                className={`h-5 w-5 ${
                  isActive 
                    ? 'text-white' 
                    : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                }`} 
              />
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium ${
                  isActive ? 'text-white' : ''
                }`}>
                  {item.name}
                </div>
                <div className={`text-xs ${
                  isActive 
                    ? 'text-blue-100' 
                    : 'text-gray-500 dark:text-gray-500'
                }`}>
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200/50 dark:border-gray-700/50">
        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Admin Dashboard v1.0
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
