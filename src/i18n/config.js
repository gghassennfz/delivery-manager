import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      deliveries: 'Deliveries',
      statistics: 'Statistics',
      profile: 'Profile',
      logout: 'Logout',
      
      // Authentication
      login: 'Login',
      email: 'Email',
      password: 'Password',
      selectRole: 'Select Role',
      projectOwner: 'Project Owner',
      deliveryGuy: 'Delivery Guy',
      admin: 'Admin',
      
      // Delivery Management
      newDelivery: 'New Delivery',
      addProduct: 'Add Product',
      productName: 'Product Name',
      quantity: 'Quantity',
      destination: 'Destination',
      selectDestination: 'Select Destination on Map',
      createDelivery: 'Create Delivery',
      
      // Delivery Status
      pending: 'Pending',
      pickedUp: 'Picked Up',
      inTransit: 'In Transit',
      delivered: 'Delivered',
      returned: 'Returned',
      
      // Actions
      markAsPickedUp: 'Mark as Picked Up',
      markAsDelivered: 'Mark as Delivered',
      markAsReturned: 'Mark as Returned',
      viewOnMap: 'View on Map',
      
      // Statistics
      totalUsers: 'Total Users',
      totalDeliveryGuys: 'Total Delivery Guys',
      totalDeliveries: 'Total Deliveries',
      successRate: 'Success Rate',
      
      // Settings
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode'
    }
  },
  fr: {
    translation: {
      // Navigation
      dashboard: 'Tableau de bord',
      deliveries: 'Livraisons',
      statistics: 'Statistiques',
      profile: 'Profil',
      logout: 'Déconnexion',
      
      // Authentication
      login: 'Connexion',
      email: 'Email',
      password: 'Mot de passe',
      selectRole: 'Sélectionner le rôle',
      projectOwner: 'Propriétaire de projet',
      deliveryGuy: 'Livreur',
      admin: 'Administrateur',
      
      // Delivery Management
      newDelivery: 'Nouvelle livraison',
      addProduct: 'Ajouter un produit',
      productName: 'Nom du produit',
      quantity: 'Quantité',
      destination: 'Destination',
      selectDestination: 'Sélectionner la destination sur la carte',
      createDelivery: 'Créer la livraison',
      
      // Delivery Status
      pending: 'En attente',
      pickedUp: 'Récupéré',
      inTransit: 'En transit',
      delivered: 'Livré',
      returned: 'Retourné',
      
      // Actions
      markAsPickedUp: 'Marquer comme récupéré',
      markAsDelivered: 'Marquer comme livré',
      markAsReturned: 'Marquer comme retourné',
      viewOnMap: 'Voir sur la carte',
      
      // Statistics
      totalUsers: 'Total utilisateurs',
      totalDeliveryGuys: 'Total livreurs',
      totalDeliveries: 'Total livraisons',
      successRate: 'Taux de réussite',
      
      // Settings
      settings: 'Paramètres',
      language: 'Langue',
      theme: 'Thème',
      darkMode: 'Mode sombre',
      lightMode: 'Mode clair'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
