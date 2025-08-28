import React, { useState, useMemo } from 'react';
import { 
  Calendar, Clock, Package, CheckCircle, XCircle, Truck, 
  User, Eye, Filter, Search, ArrowRight
} from 'lucide-react';

const DeliveryGuyActivities = ({ deliveries, users, onViewDetails }) => {
  const [selectedDeliveryGuy, setSelectedDeliveryGuy] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Get delivery guys from users
  const deliveryGuys = useMemo(() => 
    users.filter(user => user.role === 'delivery'),
    [users]
  );

  // Filter deliveries based on selected delivery guy and dates
  const filteredActivities = useMemo(() => {
    let filtered = [...deliveries];

    // Filter by delivery guy
    if (selectedDeliveryGuy !== 'all') {
      filtered = filtered.filter(delivery => 
        delivery.assignedDeliveryGuy === selectedDeliveryGuy
      );
    } else {
      // Only show assigned deliveries if "all" is selected
      filtered = filtered.filter(delivery => delivery.assignedDeliveryGuy);
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(delivery =>
        delivery.reference?.toLowerCase().includes(searchLower) ||
        delivery.recipientName?.toLowerCase().includes(searchLower) ||
        delivery.products?.some(p => p.name?.toLowerCase().includes(searchLower))
      );
    }

    // Filter by date range
    if (startDate || endDate) {
      filtered = filtered.filter(delivery => {
        const deliveryDate = delivery.createdAt?.toDate ? 
          delivery.createdAt.toDate() : 
          new Date(delivery.createdAt);
        
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start && end) {
          return deliveryDate >= start && deliveryDate <= end;
        } else if (start) {
          return deliveryDate >= start;
        } else if (end) {
          return deliveryDate <= end;
        }
        return true;
      });
    }

    // Filter by predefined date ranges
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(delivery => {
        const deliveryDate = delivery.createdAt?.toDate ? 
          delivery.createdAt.toDate() : 
          new Date(delivery.createdAt);
        
        switch (dateFilter) {
          case 'today':
            return deliveryDate >= today;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return deliveryDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return deliveryDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
      return dateB - dateA;
    });
  }, [deliveries, selectedDeliveryGuy, searchTerm, dateFilter, startDate, endDate]);

  // Get activity timeline for a delivery
  const getActivityTimeline = (delivery) => {
    const timeline = [];
    
    if (delivery.createdAt) {
      timeline.push({
        status: 'created',
        label: 'Order Created',
        date: delivery.createdAt?.toDate ? delivery.createdAt.toDate() : new Date(delivery.createdAt),
        icon: Package,
        color: 'text-blue-500'
      });
    }

    if (delivery.assignedAt) {
      timeline.push({
        status: 'assigned',
        label: 'Assigned to Delivery Guy',
        date: delivery.assignedAt?.toDate ? delivery.assignedAt.toDate() : new Date(delivery.assignedAt),
        icon: User,
        color: 'text-purple-500'
      });
    }

    if (delivery.pickedUpAt) {
      timeline.push({
        status: 'picked-up',
        label: 'Picked Up',
        date: delivery.pickedUpAt?.toDate ? delivery.pickedUpAt.toDate() : new Date(delivery.pickedUpAt),
        icon: Truck,
        color: 'text-blue-500'
      });
    }

    if (delivery.inTransitAt) {
      timeline.push({
        status: 'in-transit',
        label: 'In Transit',
        date: delivery.inTransitAt?.toDate ? delivery.inTransitAt.toDate() : new Date(delivery.inTransitAt),
        icon: Truck,
        color: 'text-orange-500'
      });
    }

    if (delivery.deliveredAt && delivery.status === 'delivered') {
      timeline.push({
        status: 'delivered',
        label: 'Delivered Successfully',
        date: delivery.deliveredAt?.toDate ? delivery.deliveredAt.toDate() : new Date(delivery.deliveredAt),
        icon: CheckCircle,
        color: 'text-green-500'
      });
    }

    if (delivery.returnedAt && delivery.status === 'returned') {
      timeline.push({
        status: 'returned',
        label: 'Returned',
        date: delivery.returnedAt?.toDate ? delivery.returnedAt.toDate() : new Date(delivery.returnedAt),
        icon: XCircle,
        color: 'text-red-500'
      });
    }

    return timeline.sort((a, b) => a.date - b.date);
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

  // Get statistics for selected delivery guy
  const getDeliveryGuyStats = () => {
    const guyDeliveries = selectedDeliveryGuy === 'all' ? 
      deliveries.filter(d => d.assignedDeliveryGuy) :
      deliveries.filter(d => d.assignedDeliveryGuy === selectedDeliveryGuy);

    return {
      total: guyDeliveries.length,
      pending: guyDeliveries.filter(d => d.status === 'pending').length,
      inTransit: guyDeliveries.filter(d => ['picked-up', 'in-transit'].includes(d.status)).length,
      delivered: guyDeliveries.filter(d => d.status === 'delivered').length,
      returned: guyDeliveries.filter(d => d.status === 'returned').length,
    };
  };

  const stats = getDeliveryGuyStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Delivery Guy Activities
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Track delivery guy performance and activity timeline
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Delivery Guy Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Delivery Guy
            </label>
            <select
              value={selectedDeliveryGuy}
              onChange={(e) => setSelectedDeliveryGuy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Delivery Guys</option>
              {deliveryGuys.map((guy) => (
                <option key={guy.id} value={guy.id}>
                  {guy.email}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Period
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Custom Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Search */}
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference, recipient, or products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Deliveries</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.pending}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-600">
            {stats.inTransit}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">In Transit</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">
            {stats.delivered}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Delivered</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-red-600">
            {stats.returned}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Returned</div>
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No activities found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              No delivery activities match your current filters
            </p>
          </div>
        ) : (
          filteredActivities.map((delivery) => {
            const timeline = getActivityTimeline(delivery);
            const deliveryGuy = deliveryGuys.find(guy => guy.id === delivery.assignedDeliveryGuy);
            
            return (
              <div key={delivery.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
                {/* Delivery Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {delivery.reference || 'N/A'}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                        {delivery.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>Recipient: {delivery.recipientName}</span>
                      <span>•</span>
                      <span>Products: {delivery.products?.map(p => p.name).join(', ')}</span>
                      {deliveryGuy && (
                        <>
                          <span>•</span>
                          <span>Delivery Guy: {deliveryGuy.email}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onViewDetails(delivery)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                </div>

                {/* Activity Timeline */}
                <div className="relative">
                  {timeline.map((activity, index) => {
                    const Icon = activity.icon;
                    const isLast = index === timeline.length - 1;
                    
                    return (
                      <div key={activity.status} className="relative flex items-start space-x-3 pb-4">
                        {/* Timeline line */}
                        {!isLast && (
                          <div className="absolute top-8 left-4 w-0.5 h-6 bg-gray-300 dark:bg-gray-600"></div>
                        )}
                        
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600`}>
                          <Icon className={`h-4 w-4 ${activity.color}`} />
                        </div>
                        
                        {/* Activity Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.label}
                            </p>
                            <ArrowRight className="h-3 w-3 text-gray-400" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {activity.date.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DeliveryGuyActivities;
