import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import AdminSidebar from './AdminSidebar';
import AdminStatistics from './AdminStatistics';
import AdminCharts from './AdminCharts';
import RecentDeliveries from './RecentDeliveries';
import DeliveryHistory from './DeliveryHistory';
import DeliveryDetailsModal from './DeliveryDetailsModal';
import AllDeliveries from './AllDeliveries';
import DeliveryGuyActivities from './DeliveryGuyActivities';

// Assignment Modal Component
const AssignmentModal = ({ isOpen, delivery, deliveryGuys, onAssign, onClose }) => {
  if (!isOpen || !delivery) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-lg shadow-xl max-w-md w-full border border-gray-200/50 dark:border-gray-700/50">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Assign Delivery Guy
          </h3>
        </div>
        
        <div className="p-6">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Delivery Details:
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Products: {delivery.products?.map(p => p.name).join(', ')}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Recipient: {delivery.recipientName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Price: ${delivery.price?.toFixed(2) || '0.00'}
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Delivery Guy:
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {deliveryGuys.map((guy) => (
                <button
                  key={guy.id}
                  onClick={() => onAssign(guy.id)}
                  className="w-full text-left p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    {guy.email}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Delivery Guy
                  </div>
                </button>
              ))}
            </div>
            {deliveryGuys.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No delivery guys available
              </p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeliveryGuys: 0,
    totalProjectOwners: 0,
    totalDeliveries: 0,
    pendingDeliveries: 0,
    completedDeliveries: 0,
    returnedDeliveries: 0
  });
  const [users, setUsers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryGuys, setDeliveryGuys] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeliveryDetails, setShowDeliveryDetails] = useState(false);
  const [activeView, setActiveView] = useState('deliveries');

  useEffect(() => {
    // Listen to users collection
    const usersUnsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = [];
      snapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
      
      // Filter delivery guys for assignment
      const deliveryGuysData = usersData.filter(user => user.role === 'delivery-guy');
      setDeliveryGuys(deliveryGuysData);

      // Calculate user statistics
      const totalUsers = usersData.length;
      const totalDeliveryGuys = deliveryGuysData.length;
      const totalProjectOwners = usersData.filter(user => user.role === 'project-owner').length;

      setStats(prev => ({
        ...prev,
        totalUsers,
        totalDeliveryGuys,
        totalProjectOwners
      }));
    });

    // Listen to deliveries collection with ordering
    const deliveriesQuery = query(
      collection(db, 'deliveries'),
      orderBy('createdAt', 'desc')
    );
    const deliveriesUnsubscribe = onSnapshot(deliveriesQuery, (snapshot) => {
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

      // Calculate delivery statistics
      const totalDeliveries = deliveriesData.length;
      const pendingDeliveries = deliveriesData.filter(d => d.status === 'pending').length;
      const completedDeliveries = deliveriesData.filter(d => d.status === 'delivered').length;
      const returnedDeliveries = deliveriesData.filter(d => d.status === 'returned').length;

      setStats(prev => ({
        ...prev,
        totalDeliveries,
        pendingDeliveries,
        completedDeliveries,
        returnedDeliveries
      }));
    });

    return () => {
      usersUnsubscribe();
      deliveriesUnsubscribe();
    };
  }, []);


  // Event handlers
  const handleAssignDelivery = async (deliveryGuyId) => {
    if (!selectedDelivery) return;

    try {
      const deliveryGuy = deliveryGuys.find(guy => guy.id === deliveryGuyId);
      await updateDoc(doc(db, 'deliveries', selectedDelivery.id), {
        assignedDeliveryGuy: deliveryGuyId,
        deliveryGuyEmail: deliveryGuy.email,
        assignedAt: new Date(),
        updatedAt: new Date()
      });
      setShowAssignModal(false);
      setSelectedDelivery(null);
    } catch (error) {
      console.error('Error assigning delivery:', error);
    }
  };

  const handleViewDetails = (delivery) => {
    setSelectedDelivery(delivery);
    setShowDeliveryDetails(true);
  };

  const handleDeleteDelivery = async (deliveryId) => {
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

  const openAssignModal = (delivery) => {
    setSelectedDelivery(delivery);
    setShowAssignModal(true);
  };

  const successRate = stats.totalDeliveries > 0 
    ? ((stats.completedDeliveries / stats.totalDeliveries) * 100).toFixed(1)
    : 0;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <AdminSidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage deliveries, users, and monitor system performance
              </p>
            </div>

            {/* Content based on active view */}
            {activeView === 'statistics' && (
              <AdminStatistics 
                stats={stats} 
                users={users} 
                deliveries={deliveries} 
              />
            )}
            
            {activeView === 'charts' && (
              <AdminCharts 
                stats={stats} 
                deliveries={deliveries} 
                users={users} 
              />
            )}
            
            {activeView === 'deliveries' && (
              <AllDeliveries 
                deliveries={deliveries}
                onAssign={openAssignModal}
                onViewDetails={handleViewDetails}
                onDelete={handleDeleteDelivery}
              />
            )}
            
            {activeView === 'recent-deliveries' && (
              <RecentDeliveries 
                deliveries={deliveries}
                onAssign={openAssignModal}
                onViewDetails={handleViewDetails}
                onDelete={handleDeleteDelivery}
              />
            )}
            
            {activeView === 'delivery-history' && (
              <DeliveryHistory 
                deliveries={deliveries}
                onAssign={openAssignModal}
                onViewDetails={handleViewDetails}
                onDelete={handleDeleteDelivery}
              />
            )}
            
            {activeView === 'delivery-guy-activities' && (
              <DeliveryGuyActivities 
                deliveries={deliveries}
                users={users}
                onViewDetails={handleViewDetails}
              />
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={showAssignModal}
        delivery={selectedDelivery}
        deliveryGuys={deliveryGuys}
        onAssign={handleAssignDelivery}
        onClose={() => setShowAssignModal(false)}
      />

      {/* Delivery Details Modal */}
      <DeliveryDetailsModal
        isOpen={showDeliveryDetails}
        delivery={selectedDelivery}
        onClose={() => setShowDeliveryDetails(false)}
      />
    </div>
  );
};

export default AdminDashboard;
