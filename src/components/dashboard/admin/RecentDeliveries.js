import React from 'react';
import { Eye, UserCheck, Clock, CheckCircle, XCircle, Truck, Package, Hash } from 'lucide-react';

const RecentDeliveries = ({ deliveries = [], deliveryGuys = [], onViewDetails, onAssign, onDelete }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'picked-up':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'in-transit':
        return <Truck className="h-4 w-4 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'returned':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'picked-up':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in-transit':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'returned':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  const recentDeliveries = deliveries && Array.isArray(deliveries) ? deliveries.slice(0, 10) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Recent Deliveries
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Latest delivery activities and status updates
        </p>
      </div>

      {/* Recent Deliveries Table */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Latest {recentDeliveries.length} Deliveries
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50/50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm divide-y divide-gray-200 dark:divide-gray-700">
              {recentDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                        {delivery.reference}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {delivery.products && delivery.products.length > 0 ? (
                        <>
                          {delivery.products.map(p => `${p.name} (×${p.quantity || 1})`).join(', ').substring(0, 50)}
                          {delivery.products.map(p => `${p.name} (×${p.quantity || 1})`).join(', ').length > 50 && '...'}
                        </>
                      ) : 'No products'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {delivery.products ? delivery.products.length : 0} item(s)
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(delivery.status)}
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {delivery.recipientName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {delivery.recipientPhone}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(delivery.createdAt)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                    ${delivery.price?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewDetails(delivery)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {!delivery.assignedDeliveryGuy && deliveryGuys && deliveryGuys.length > 0 && onAssign && (
                        <button
                          onClick={() => onAssign(delivery)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded transition-colors"
                          title="Assign Delivery Guy"
                        >
                          <UserCheck className="h-4 w-4" />
                        </button>
                      )}
                      {delivery.assignedDeliveryGuy && (
                        <span className="text-green-600 dark:text-green-400 text-xs px-2 py-1 bg-green-50 dark:bg-green-900/20 rounded">
                          Assigned
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {recentDeliveries.length === 0 && (
          <div className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No deliveries found</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No delivery records available at the moment.
            </p>
          </div>
        )}

        {recentDeliveries.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-gray-50/50 dark:bg-gray-700/50">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {recentDeliveries.length} of {deliveries ? deliveries.length : 0} total deliveries
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentDeliveries;
