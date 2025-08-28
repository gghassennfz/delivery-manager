import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminCharts = ({ deliveries, users, stats }) => {
  // Chart configurations
  const deliveryStatusData = {
    labels: ['Pending', 'Picked Up', 'In Transit', 'Delivered', 'Returned'],
    datasets: [{
      label: 'Deliveries by Status',
      data: [
        deliveries.filter(d => d.status === 'pending').length,
        deliveries.filter(d => d.status === 'picked-up').length,
        deliveries.filter(d => d.status === 'in-transit').length,
        stats.completedDeliveries,
        stats.returnedDeliveries
      ],
      backgroundColor: [
        'rgba(250, 204, 21, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(239, 68, 68, 0.8)'
      ],
      borderColor: [
        'rgba(250, 204, 21, 1)',
        'rgba(59, 130, 246, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 2
    }]
  };

  const userRoleData = {
    labels: ['Project Owners', 'Delivery Guys', 'Admins'],
    datasets: [{
      label: 'Users by Role',
      data: [
        stats.totalProjectOwners,
        stats.totalDeliveryGuys,
        users.filter(user => user.role === 'admin').length
      ],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(147, 51, 234, 0.8)'
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(147, 51, 234, 1)'
      ],
      borderWidth: 2
    }]
  };

  // Generate delivery trends (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const deliveryTrendsData = {
    labels: last7Days.map(date => new Date(date).toLocaleDateString()),
    datasets: [{
      label: 'Deliveries Created',
      data: last7Days.map(date => {
        return deliveries.filter(d => {
          if (!d.createdAt) return false;
          const deliveryDate = (d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt)).toISOString().split('T')[0];
          return deliveryDate === date;
        }).length;
      }),
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true
    }]
  };

  // Monthly delivery trends (last 6 months)
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      month: date.toISOString().slice(0, 7), // YYYY-MM format
      label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
  }).reverse();

  const monthlyTrendsData = {
    labels: last6Months.map(m => m.label),
    datasets: [
      {
        label: 'Completed Deliveries',
        data: last6Months.map(({ month }) => {
          return deliveries.filter(d => {
            if (!d.createdAt || d.status !== 'delivered') return false;
            const deliveryMonth = (d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt)).toISOString().slice(0, 7);
            return deliveryMonth === month;
          }).length;
        }),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2
      },
      {
        label: 'Total Deliveries',
        data: last6Months.map(({ month }) => {
          return deliveries.filter(d => {
            if (!d.createdAt) return false;
            const deliveryMonth = (d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt)).toISOString().slice(0, 7);
            return deliveryMonth === month;
          }).length;
        }),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.3)',
        }
      },
      x: {
        grid: {
          color: 'rgba(156, 163, 175, 0.3)',
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics & Charts
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Visual insights and delivery trends
        </p>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Delivery Status Distribution
          </h3>
          <div className="h-64">
            <Doughnut data={deliveryStatusData} options={doughnutOptions} />
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Users by Role
          </h3>
          <div className="h-64">
            <Bar data={userRoleData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Daily Delivery Trends (Last 7 Days)
        </h3>
        <div className="h-64">
          <Line data={deliveryTrendsData} options={chartOptions} />
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Monthly Performance (Last 6 Months)
        </h3>
        <div className="h-64">
          <Bar data={monthlyTrendsData} options={chartOptions} />
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Today's Deliveries</span>
              <span className="font-semibold text-blue-600">
                {deliveries.filter(d => {
                  if (!d.createdAt) return false;
                  const today = new Date().toDateString();
                  const deliveryDate = (d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt)).toDateString();
                  return deliveryDate === today;
                }).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">This Week</span>
              <span className="font-semibold text-green-600">
                {deliveries.filter(d => {
                  if (!d.createdAt) return false;
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  const deliveryDate = d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
                  return deliveryDate >= weekAgo;
                }).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">This Month</span>
              <span className="font-semibold text-purple-600">
                {deliveries.filter(d => {
                  if (!d.createdAt) return false;
                  const monthAgo = new Date();
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  const deliveryDate = d.createdAt.toDate ? d.createdAt.toDate() : new Date(d.createdAt);
                  return deliveryDate >= monthAgo;
                }).length}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Metrics
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Success Rate</span>
              <span className="font-semibold text-green-600">
                {stats.totalDeliveries > 0 ? ((stats.completedDeliveries / stats.totalDeliveries) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Return Rate</span>
              <span className="font-semibold text-red-600">
                {stats.totalDeliveries > 0 ? ((stats.returnedDeliveries / stats.totalDeliveries) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Pending Rate</span>
              <span className="font-semibold text-yellow-600">
                {stats.totalDeliveries > 0 ? ((stats.pendingDeliveries / stats.totalDeliveries) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Activity Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Active Users</span>
              <span className="font-semibold text-blue-600">{users.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Available Drivers</span>
              <span className="font-semibold text-green-600">{stats.totalDeliveryGuys}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Active Deliveries</span>
              <span className="font-semibold text-orange-600">
                {stats.totalDeliveries - stats.completedDeliveries - stats.returnedDeliveries}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCharts;
