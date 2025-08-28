import React from 'react';
import { X, Package, User, Phone, Mail, MapPin, DollarSign, Calendar, Clock, CheckCircle, XCircle, Truck, Hash, Building } from 'lucide-react';

const DeliveryDetailsModal = ({ delivery, isOpen, onClose }) => {
  if (!isOpen || !delivery) return null;

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

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const calculateTotal = () => {
    return delivery.products?.reduce((sum, product) => {
      return sum + (product.price * (product.quantity || 1));
    }, 0) || 0;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-gray-700/50">
        {/* Header */}
        <div className="sticky top-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-t-xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Delivery Details
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <Hash className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                  {delivery.reference}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                {getStatusIcon(delivery.status)}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(delivery.status)}`}>
                  {delivery.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Status</p>
            </div>

            <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-500" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ${delivery.price?.toFixed(2) || calculateTotal().toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
            </div>

            <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatDate(delivery.createdAt).split(',')[0]}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Created Date</p>
            </div>
          </div>

          {/* Products */}
          <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Products ({delivery.products?.length || 0})
            </h3>
            <div className="space-y-3">
              {delivery.products?.map((product, index) => (
                <div key={index} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </h4>
                      {product.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {product.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900 dark:text-white">
                        ${product.price?.toFixed(2) || '0.00'} × {product.quantity || 1}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        = ${((product.price || 0) * (product.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recipient Information */}
          <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Recipient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {delivery.recipientName || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {delivery.recipientPhone || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {delivery.recipientEmail && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {delivery.recipientEmail}
                      </p>
                    </div>
                  </div>
                )}
                {delivery.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {delivery.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Owner and Assignment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Project Owner
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">
                    {delivery.ownerEmail || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Delivery Assignment
              </h3>
              <div className="space-y-2">
                {delivery.deliveryGuyEmail ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        Assigned
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-900 dark:text-white">
                        {delivery.deliveryGuyEmail}
                      </span>
                    </div>
                    {delivery.assignedAt && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Assigned: {formatDate(delivery.assignedAt)}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-600 dark:text-red-400">
                      Not assigned
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Timeline
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Created</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatDate(delivery.createdAt)}
                </p>
              </div>
              {delivery.updatedAt && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Last Updated</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(delivery.updatedAt)}
                  </p>
                </div>
              )}
              {delivery.assignedAt && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Assigned</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(delivery.assignedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          {delivery.notes && (
            <div className="bg-gray-50/50 dark:bg-gray-700/50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notes
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {delivery.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-b-xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailsModal;
