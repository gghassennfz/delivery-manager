import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// Custom hook for notifications
const useNotification = () => {
  const [notification, setNotification] = useState(null);
  
  const showNotification = (message, type = 'info') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), 5000);
  };
  
  return { notification, showNotification, clearNotification: () => setNotification(null) };
};

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification, clearNotification } = useNotification();

  const signup = async (email, password, role, additionalData = {}) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      try {
        // Save user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          role: role,
          createdAt: new Date(),
          ...additionalData
        });
        showNotification('Account created successfully! Welcome aboard!', 'success');
      } catch (firestoreError) {
        console.error('Error saving user data to Firestore:', firestoreError);
        showNotification('Account created but profile setup incomplete. Please contact support.', 'warning');
      }
      
      return user;
    } catch (error) {
      let errorMessage = 'Failed to create account';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Please try logging in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password too weak. Please use at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.message.includes('400')) {
        errorMessage = 'Authentication not enabled. Please contact support.';
      }
      showNotification(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      showNotification('Welcome back!', 'success');
      return userCredential;
    } catch (error) {
      let errorMessage = 'Failed to log in';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      showNotification(errorMessage, 'error');
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const getUserRole = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data().role;
      }
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      // Return null if offline or error occurs
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const role = await getUserRole(user.uid);
        setUserRole(role);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    logout,
    loading,
    notification,
    showNotification,
    clearNotification
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
