import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { 
  Package, MapPin, CheckCircle, XCircle, Navigation, Clock, Truck,
  Search, ChevronLeft, ChevronRight, Hash
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { formatTunisianPhone } from '../../../utils/validations';

const DeliveryGuyDashboard = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!currentUser) return;

    console.log('Delivery guy user ID:', currentUser.uid);
    console.log('Querying for deliveries assigned to:', currentUser.uid);

    const q = query(
      collection(db, 'deliveries'),
      where('assignedDeliveryGuy', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const deliveriesData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        deliveriesData.push({ 
          id: doc.id, 
          ...data,
          // Ensure reference exists
          reference: data.reference || `DLV-${doc.id.slice(0, 8).toUpperCase()}`
        });
      });
      setDeliveries(deliveriesData);
      console.log('Delivery guy loaded deliveries:', deliveriesData.length);
    }, (error) => {
      console.error('Error loading delivery guy deliveries:', error);
      // Fallback: try loading without orderBy if index is missing
      if (error.code === 'failed-precondition') {
        console.log('Index missing for delivery guy, trying fallback query...');
        const fallbackQuery = query(
          collection(db, 'deliveries'),
          where('assignedDeliveryGuy', '==', currentUser.uid)
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
          console.log('Delivery guy loaded deliveries (fallback):', deliveriesData.length);
        });
        
        return fallbackUnsubscribe;
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const updateDeliveryStatus = async (deliveryId, newStatus) => {
    setLoading(true);
    try {
      const updates = {
        status: newStatus,
        deliveryGuyId: currentUser.uid,
        deliveryGuyEmail: currentUser.email,
        updatedAt: new Date()
      };

      // Set specific timestamps for each status
      if (newStatus === 'picked-up') {
        updates.pickedUpAt = new Date();
      } else if (newStatus === 'in-transit') {
        updates.inTransitAt = new Date();
      } else if (newStatus === 'delivered') {
        updates.deliveredAt = new Date();
      } else if (newStatus === 'returned') {
        updates.returnedAt = new Date();
      }

      await updateDoc(doc(db, 'deliveries', deliveryId), updates);
    } catch (error) {
      console.error('Error updating delivery status:', error);
    }
    setLoading(false);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'picked-up':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'in-transit':
        return <Truck className="h-5 w-5 text-orange-500" />;
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
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getNextAction = (status) => {
    switch (status) {
      case 'pending':
        return { text: t('markAsPickedUp'), nextStatus: 'picked-up', color: 'bg-blue-600 hover:bg-blue-700' };
      case 'picked-up':
        return { text: 'Start Delivery', nextStatus: 'in-transit', color: 'bg-orange-600 hover:bg-orange-700' };
      case 'in-transit':
        return null;
      default:
        return null;
    }
  };

  const openInGoogleMaps = (destination) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`;
    window.open(url, '_blank');
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Delivery Dashboard
        </h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowMap(!showMap)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <MapPin className="h-5 w-5" />
            <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by reference, name, phone..."
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center">
            <Package className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Available Deliveries
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {deliveries.filter(d => d.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center">
            <Truck className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                My Pickups
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {deliveries.filter(d => d.deliveryGuyId === currentUser?.uid && d.status === 'picked-up').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center">
            <Navigation className="h-8 w-8 text-orange-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                In Transit
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {deliveries.filter(d => d.deliveryGuyId === currentUser?.uid && d.status === 'in-transit').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {showMap && (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Delivery Locations
          </h2>
          <div className="h-96 rounded-lg overflow-hidden">
            <MapContainer
              center={[36.8065, 10.1815]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {deliveries.map((delivery) => (
                delivery.destination && (
                  <Marker
                    key={delivery.id}
                    position={[delivery.destination.lat, delivery.destination.lng]}
                  >
                    <Popup>
                      <div className="p-2">
                        <p className="font-semibold">
                          {delivery.products.map(p => p.name).join(', ')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: {delivery.status}
                        </p>
                        <p className="text-sm text-gray-600">
                          Owner: {delivery.ownerEmail}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}
            </MapContainer>
          </div>
        </div>
      )}

      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            My Assigned Deliveries
          </h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedDeliveries.map((delivery) => (
            <div key={delivery.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                      {delivery.reference}
                    </span>
                    {getStatusIcon(delivery.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                      {t(delivery.status)}
                    </span>
                    {delivery.deliveryGuyId === currentUser?.uid && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Assigned to me
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {delivery.products.map(p => `${p.name} (×${p.quantity})`).join(', ')}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                          <Package className="h-4 w-4 mr-1" />
                          <span>From: {delivery.ownerEmail}</span>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            Recipient Details:
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Name: {delivery.recipientName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Phone: {formatTunisianPhone(delivery.recipientPhone || '')}
                          </p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Price: ${delivery.price?.toFixed(2) || '0.00'}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        {delivery.destination && (
                          <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>
                              Destination: {delivery.destination.lat.toFixed(4)}, {delivery.destination.lng.toFixed(4)}
                            </span>
                          </div>
                        )}
                        
                        {delivery.notes && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            <span className="font-medium">Notes:</span> {delivery.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
                    {new Date(delivery.createdAt.toDate()).toLocaleString()}
                  </div>
                  
                  <div className="flex space-x-2">
                    {delivery.destination && (
                      <button
                        onClick={() => openInGoogleMaps(delivery.destination)}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center space-x-1"
                      >
                        <Navigation className="h-4 w-4" />
                        <span>Navigate</span>
                      </button>
                    )}
                    
                    {getNextAction(delivery.status) && (
                      <button
                        onClick={() => updateDeliveryStatus(delivery.id, getNextAction(delivery.status).nextStatus)}
                        disabled={loading}
                        className={`px-3 py-1 text-white rounded text-sm transition-colors duration-200 ${getNextAction(delivery.status).color} disabled:opacity-50`}
                      >
                        {getNextAction(delivery.status).text}
                      </button>
                    )}
                    
                    {delivery.status === 'in-transit' && delivery.deliveryGuyId === currentUser?.uid && (
                      <>
                        <button
                          onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                          disabled={loading}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm flex items-center space-x-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>{t('markAsDelivered')}</span>
                        </button>
                        
                        <button
                          onClick={() => updateDeliveryStatus(delivery.id, 'returned')}
                          disabled={loading}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm flex items-center space-x-1"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>{t('markAsReturned')}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {filteredDeliveries.length === 0 && (
            <div className="p-12 text-center">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No deliveries available
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check back later for new delivery assignments.
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
    </div>
  );
};

export default DeliveryGuyDashboard;
