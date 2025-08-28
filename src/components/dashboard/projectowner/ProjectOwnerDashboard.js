import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Plus, Package, MapPin, Clock, CheckCircle, XCircle, Truck, User, Phone, DollarSign, Mail, AlertCircle,
  Search, ChevronLeft, ChevronRight, Edit2, Trash2, Hash
} from 'lucide-react';
import MapSelector from '../../map/MapSelector';
import { 
  validateTunisianPhone, 
  validateEmail, 
  generateDeliveryReference,
  validateRequired,
  formatTunisianPhone,
  validatePrice 
} from '../../../utils/validations';

const ProjectOwnerDashboard = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [showNewDeliveryForm, setShowNewDeliveryForm] = useState(false);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [newDelivery, setNewDelivery] = useState({
    products: [{ name: '', quantity: 1 }],
    destination: null,
    address: '',
    notes: '',
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, 'deliveries'),
        where('ownerId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const deliveriesData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          deliveriesData.push({ 
            id: doc.id, 
            ...data,
            reference: data.reference || `DLV-${doc.id.slice(0, 8).toUpperCase()}`
          });
        });
        setDeliveries(deliveriesData);
        console.log('Loaded deliveries:', deliveriesData.length);
      }, (error) => {
        console.error('Error loading deliveries:', error);
        // Fallback: try loading without orderBy if index is missing
        if (error.code === 'failed-precondition') {
          console.log('Index missing, trying fallback query...');
          const fallbackQuery = query(
            collection(db, 'deliveries'),
            where('ownerId', '==', currentUser.uid)
          );
          
          const fallbackUnsubscribe = onSnapshot(fallbackQuery, (snapshot) => {
            const deliveriesData = [];
            snapshot.forEach((doc) => {
              const data = doc.data();
              deliveriesData.push({ 
                id: doc.id, 
                ...data,
                reference: data.reference || `DLV-${doc.id.slice(0, 8).toUpperCase()}`
              });
            });
            // Sort manually since we can't use orderBy
            deliveriesData.sort((a, b) => {
              const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
              const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
              return bDate - aDate;
            });
            setDeliveries(deliveriesData);
            console.log('Loaded deliveries (fallback):', deliveriesData.length);
          });
          
          return fallbackUnsubscribe;
        }
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const addProduct = () => {
    setNewDelivery({
      ...newDelivery,
      products: [...newDelivery.products, { name: '', quantity: 1 }]
    });
  };

  // Filter deliveries based on search and filters
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
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.setDate(now.getDate() - 7));
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter(delivery => {
        const deliveryDate = delivery.createdAt?.toDate ? delivery.createdAt.toDate() : new Date(delivery.createdAt);
        switch (dateFilter) {
          case 'today':
            return deliveryDate >= todayStart;
          case 'week':
            return deliveryDate >= weekStart;
          case 'month':
            return deliveryDate >= monthStart;
          default:
            return true;
        }
      });
    }

    return filtered;
  }, [deliveries, searchTerm, statusFilter, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage);
  const paginatedDeliveries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredDeliveries.slice(start, end);
  }, [filteredDeliveries, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  const updateProduct = (index, field, value) => {
    const updatedProducts = [...newDelivery.products];
    updatedProducts[index][field] = value;
    setNewDelivery({ ...newDelivery, products: updatedProducts });
  };

  const removeProduct = (index) => {
    const updatedProducts = newDelivery.products.filter((_, i) => i !== index);
    setNewDelivery({ ...newDelivery, products: updatedProducts });
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    // Validate recipient name
    const nameValidation = validateRequired(newDelivery.recipientName, 'Recipient name');
    if (!nameValidation.isValid) newErrors.recipientName = nameValidation.error;
    
    // Validate phone
    const phoneValidation = validateTunisianPhone(newDelivery.recipientPhone);
    if (!phoneValidation.isValid) newErrors.recipientPhone = phoneValidation.error;
    
    // Validate email if provided
    if (newDelivery.recipientEmail) {
      const emailValidation = validateEmail(newDelivery.recipientEmail);
      if (!emailValidation.isValid) newErrors.recipientEmail = emailValidation.error;
    }
    
    // Validate price
    const priceValidation = validatePrice(newDelivery.price);
    if (!priceValidation.isValid) newErrors.price = priceValidation.error;
    
    // Validate products
    const validProducts = newDelivery.products.filter(p => p.name.trim() !== '');
    if (validProducts.length === 0) {
      newErrors.products = 'At least one product is required';
    }
    
    // Validate destination
    if (!newDelivery.destination) {
      newErrors.destination = 'Delivery location is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const reference = generateDeliveryReference();
      
      await addDoc(collection(db, 'deliveries'), {
        reference,
        ownerId: currentUser.uid,
        ownerEmail: currentUser.email,
        products: newDelivery.products.filter(p => p.name.trim() !== ''),
        destination: {
          lat: newDelivery.destination.lat,
          lng: newDelivery.destination.lng
        },
        address: newDelivery.address || '',
        notes: newDelivery.notes || '',
        recipientName: newDelivery.recipientName,
        recipientPhone: newDelivery.recipientPhone,
        recipientEmail: newDelivery.recipientEmail,
        price: parseFloat(newDelivery.price) || 0,
        status: 'pending',
        assignedDeliveryGuy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      setNewDelivery({
        products: [{ name: '', quantity: 1 }],
        destination: null,
        notes: '',
        recipientName: '',
        recipientPhone: '',
        recipientEmail: '',
        price: ''
      });
      setErrors({});
      setShowNewDeliveryForm(false);
    } catch (error) {
      console.error('Error creating delivery:', error);
      alert('Failed to create delivery. Please try again.');
    }

    setLoading(false);
  };

  // Handle Edit
  const handleEditDelivery = (delivery) => {
    // Check if delivery can be edited (only pending deliveries)
    if (delivery.status !== 'pending') {
      alert('Cannot edit delivery. Only pending deliveries can be edited.');
      return;
    }
    
    setEditingDelivery(delivery);
    setNewDelivery({
      products: delivery.products || [{ name: '', quantity: 1 }],
      destination: delivery.destination,
      address: delivery.address || '',
      notes: delivery.notes || '',
      recipientName: delivery.recipientName || '',
      recipientPhone: delivery.recipientPhone || '',
      recipientEmail: delivery.recipientEmail || '',
      price: delivery.price?.toString() || ''
    });
    setShowNewDeliveryForm(true);
  };

  // Handle Update
  const handleUpdateDelivery = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      await updateDoc(doc(db, 'deliveries', editingDelivery.id), {
        products: newDelivery.products.filter(p => p.name.trim() !== ''),
        destination: {
          lat: newDelivery.destination.lat,
          lng: newDelivery.destination.lng
        },
        address: newDelivery.address || '',
        notes: newDelivery.notes || '',
        recipientName: newDelivery.recipientName,
        recipientPhone: newDelivery.recipientPhone,
        recipientEmail: newDelivery.recipientEmail,
        price: parseFloat(newDelivery.price) || 0,
        updatedAt: new Date()
      });

      setNewDelivery({
        products: [{ name: '', quantity: 1 }],
        destination: null,
        notes: '',
        recipientName: '',
        recipientPhone: '',
        recipientEmail: '',
        price: ''
      });
      setEditingDelivery(null);
      setErrors({});
      setShowNewDeliveryForm(false);
    } catch (error) {
      console.error('Error updating delivery:', error);
      alert('Failed to update delivery. Please try again.');
    }

    setLoading(false);
  };

  // Handle Delete
  const handleDeleteDelivery = async (deliveryId, status) => {
    if (status !== 'pending') {
      alert('Cannot delete delivery. Only pending deliveries can be deleted.');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this delivery?')) {
      return;
    }
    
    try {
      await deleteDoc(doc(db, 'deliveries', deliveryId));
    } catch (error) {
      console.error('Error deleting delivery:', error);
      alert('Failed to delete delivery. Please try again.');
    }
  };

  // Reset form helper
  const resetForm = () => {
    setNewDelivery({
      products: [{ name: '', quantity: 1 }],
      destination: null,
      address: '',
      notes: '',
      recipientName: '',
      recipientPhone: '',
      recipientEmail: '',
      price: ''
    });
    setErrors({});
  };

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
        return <Clock className="h-5 w-5 text-gray-500" />;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('dashboard')}
        </h1>
        <button
          onClick={() => setShowNewDeliveryForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>{t('newDelivery')}</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Deliveries
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {deliveries.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Delivered
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {deliveries.filter(d => d.status === 'delivered').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {deliveries.filter(d => d.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search deliveries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
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
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
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

      {/* Deliveries List */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('deliveries')}
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedDeliveries.map((delivery) => (
            <div key={delivery.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                      {delivery.reference}
                    </span>
                    {getStatusIcon(delivery.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {t(delivery.status)}
                    </span>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {delivery.products.map(p => `${p.name} (×${p.quantity})`).join(', ')}
                    </h3>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <User className="h-4 w-4 mr-2" />
                      <span>{delivery.recipientName}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{formatTunisianPhone(delivery.recipientPhone || '')}</span>
                    </div>
                    {delivery.recipientEmail && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{delivery.recipientEmail}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span className="font-medium">{delivery.price?.toFixed(2) || '0.00'} TND</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {delivery.createdAt && new Date(delivery.createdAt.toDate ? delivery.createdAt.toDate() : delivery.createdAt).toLocaleDateString()}
                  </div>
                  {delivery.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditDelivery(delivery)}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center"
                      >
                        <Edit2 className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteDelivery(delivery.id, delivery.status)}
                        className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-800 flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {filteredDeliveries.length === 0 && (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No deliveries yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create your first delivery to get started.
              </p>
            </div>
          )}
        </div>
        
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
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
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
                      className={`px-3 py-1 rounded ${
                        currentPage === page
                          ? 'bg-primary-600 text-white'
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
                  className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New/Edit Delivery Modal */}
      {showNewDeliveryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/50 dark:border-gray-700/50">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingDelivery ? 'Edit Delivery' : t('newDelivery')}
              </h3>
            </div>
            
            <form onSubmit={editingDelivery ? handleUpdateDelivery : handleCreateDelivery} className="p-6">
              {/* Products */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Products *
                </label>
                {errors.products && (
                  <div className="mb-2 text-red-500 text-sm flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.products}
                  </div>
                )}
                {newDelivery.products.map((product, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      placeholder={t('productName')}
                      value={product.name}
                      onChange={(e) => updateProduct(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      required
                    />
                    <input
                      type="number"
                      placeholder={t('quantity')}
                      value={product.quantity}
                      onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value))}
                      className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      min="1"
                      required
                    />
                    {newDelivery.products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProduct(index)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addProduct}
                  className="mt-2 text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {t('addProduct')}
                </button>
              </div>

              {/* Recipient Details */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Recipient Information
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Recipient Name *"
                        value={newDelivery.recipientName}
                        onChange={(e) => setNewDelivery({ ...newDelivery, recipientName: e.target.value })}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors.recipientName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {errors.recipientName && (
                        <p className="mt-1 text-red-500 text-xs">{errors.recipientName}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        placeholder="Phone (8 digits) *"
                        value={newDelivery.recipientPhone}
                        onChange={(e) => setNewDelivery({ ...newDelivery, recipientPhone: e.target.value })}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors.recipientPhone ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {errors.recipientPhone && (
                        <p className="mt-1 text-red-500 text-xs">{errors.recipientPhone}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        placeholder="Email (optional)"
                        value={newDelivery.recipientEmail}
                        onChange={(e) => setNewDelivery({ ...newDelivery, recipientEmail: e.target.value })}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors.recipientEmail ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {errors.recipientEmail && (
                        <p className="mt-1 text-red-500 text-xs">{errors.recipientEmail}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Price in TND *"
                        value={newDelivery.price}
                        onChange={(e) => setNewDelivery({ ...newDelivery, price: e.target.value })}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                          errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {errors.price && (
                        <p className="mt-1 text-red-500 text-xs">{errors.price}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Delivery Location *
                </label>
                
                {/* Address Input Field */}
                <div className="relative mb-3">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter delivery address (optional)"
                    value={newDelivery.address}
                    onChange={(e) => setNewDelivery({ ...newDelivery, address: e.target.value })}
                    className="w-full pl-10 pr-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  />
                </div>
                
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Or select location on map:
                </div>
                
                {errors.destination && (
                  <div className="text-red-500 text-sm mt-1 mb-2">
                    {errors.destination}
                  </div>
                )}
                
                <MapSelector
                  onLocationSelect={(location) => setNewDelivery({ ...newDelivery, destination: location })}
                  selectedLocation={newDelivery.destination}
                />
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={newDelivery.notes}
                  onChange={(e) => setNewDelivery({ ...newDelivery, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Additional notes for delivery..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewDeliveryForm(false);
                    setEditingDelivery(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (editingDelivery ? 'Updating...' : 'Creating...') : (editingDelivery ? 'Update Delivery' : t('createDelivery'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectOwnerDashboard;
