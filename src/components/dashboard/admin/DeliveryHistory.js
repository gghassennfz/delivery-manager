import React, { useState, useMemo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Eye, UserCheck, Trash2, Hash, Clock, CheckCircle, XCircle, User, Phone, Mail, DollarSign, MapPin, Truck, Package } from 'lucide-react';

const DeliveryHistory = ({ deliveries, deliveryGuys, onViewDetails, onAssignDelivery, onDeleteDelivery }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'picked-up':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'in-transit':
        return <Truck className="h-5 w-5 text-orange-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'returned':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
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

  // Filtering logic
  const filteredDeliveries = useMemo(() => {
    let filtered = [...deliveries];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(delivery => {
        const searchLower = searchTerm.toLowerCase();
        return (
          delivery.reference?.toLowerCase().includes(searchLower) ||
          delivery.recipientName?.toLowerCase().includes(searchLower) ||
          delivery.recipientPhone?.includes(searchTerm) ||
          delivery.recipientEmail?.toLowerCase().includes(searchLower) ||
          delivery.ownerEmail?.toLowerCase().includes(searchLower) ||
          delivery.products?.some(p => p.name?.toLowerCase().includes(searchLower))
        );
      });
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(delivery => delivery.status === statusFilter);
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(delivery => {
        const deliveryDate = delivery.createdAt?.toDate ? delivery.createdAt.toDate() : new Date(delivery.createdAt);
        
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
    
    return filtered;
  }, [deliveries, searchTerm, statusFilter, dateFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
  const paginatedDeliveries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDeliveries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDeliveries, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Delivery History
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Complete delivery records with advanced filtering and search
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search deliveries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="picked-up">Picked Up</option>
            <option value="in-transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="returned">Returned</option>
          </select>
          
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {filteredDeliveries.length} deliveries found
            </span>
          </div>
        </div>
      </div>

      {/* Delivery History List */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            All Deliveries
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedDeliveries.map((delivery) => (
            <div key={delivery.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                      {delivery.reference}
                    </span>
                    {getStatusIcon(delivery.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {delivery.status}
                    </span>
                  </div>
                  
                  <div className="mt-3 space-y-3">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {delivery.products?.map(p => `${p.name} (×${p.quantity || 1})`).join(', ')}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <User className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{delivery.recipientName}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{delivery.recipientPhone}</span>
                      </div>
                      {delivery.recipientEmail && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>{delivery.recipientEmail}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="font-medium">${delivery.price?.toFixed(2) || '0.00'}</span>
                      </div>
                      {delivery.address && (
                        <div className="flex items-center text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{delivery.address}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>Owner: {delivery.ownerEmail}</span>
                      {delivery.deliveryGuyEmail && (
                        <span>Assigned to: {delivery.deliveryGuyEmail}</span>
                      )}
                      <span>Created: {formatDate(delivery.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onViewDetails(delivery)}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    {!delivery.assignedDeliveryGuy && deliveryGuys.length > 0 && (
                      <button
                        onClick={() => onAssignDelivery(delivery)}
                        className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-sm hover:bg-green-200 dark:hover:bg-green-800 flex items-center transition-colors"
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Assign
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteDelivery(delivery.id)}
                      className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-800 flex items-center transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {paginatedDeliveries.length === 0 && (
          <div className="p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">No deliveries found</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              No deliveries match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredDeliveries.length)} of {filteredDeliveries.length} deliveries
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryHistory;
