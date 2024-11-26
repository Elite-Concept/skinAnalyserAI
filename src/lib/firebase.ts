import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  writeBatch,
  getDoc,
  runTransaction,
  increment
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCkU_BuGjj4h3NkL6HtOIFE8VTXBacolug",
  authDomain: "skinanalyserai.firebaseapp.com",
  projectId: "skinanalyserai",
  storageBucket: "skinanalyserai.firebasestorage.app",
  messagingSenderId: "1037934306740",
  appId: "1:1037934306740:web:744a3e051f7c00d4f93ee1",
  measurementId: "G-SG2YQPZKMF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Auth functions
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

export const loginUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logoutUser = () => {
  return signOut(auth);
};

export const sendPasswordResetEmail = async (email: string): Promise<void> => {
  const actionCodeSettings = {
    url: `${window.location.origin}/login`,
    handleCodeInApp: false
  };

  try {
    await firebaseSendPasswordResetEmail(auth, email, actionCodeSettings);
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

// Lead management functions
export const addLead = async (leadData: {
  name: string;
  email: string;
  phone: string;
  userId: string;
  analysisId: string;
}) => {
  try {
    const docRef = await addDoc(collection(db, 'leads'), {
      ...leadData,
      timestamp: serverTimestamp(),
      status: 'new'
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding lead:', error);
    throw new Error('Failed to save lead information');
  }
};

export const getLeads = async (userId: string) => {
  try {
    const leadsRef = collection(db, 'leads');
    const q = query(leadsRef, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw new Error('Failed to fetch leads');
  }
};

export const deleteLeads = async (userId: string, leadIds: string[]): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Verify user owns the leads before deletion
    for (const leadId of leadIds) {
      const leadRef = doc(db, 'leads', leadId);
      const leadDoc = await getDoc(leadRef);
      
      if (leadDoc.exists() && leadDoc.data().userId === userId) {
        batch.delete(leadRef);
      } else {
        throw new Error('Unauthorized to delete one or more leads');
      }
    }

    await batch.commit();
  } catch (error) {
    console.error('Error deleting leads:', error);
    throw new Error('Failed to delete leads');
  }
};

// User management functions
export const isUserAdmin = async (uid: string): Promise<boolean> => {
  try {
    // First try direct document lookup
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists() && userDoc.data()?.role === 'admin') {
      return true;
    }

    // Fallback to query
    const adminQuery = query(
      collection(db, 'users'),
      where('uid', '==', uid),
      where('role', '==', 'admin')
    );
    const querySnapshot = await getDocs(adminQuery);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const updateUserStatus = async (userId: string, status: 'active' | 'inactive') => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      status,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

export async function incrementAnalysisCount(userId: string): Promise<void> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', userId);

    await runTransaction(db, async (transaction) => {
      const subscriptionDoc = await transaction.get(subscriptionRef);

      if (!subscriptionDoc.exists()) {
        throw new Error('No subscription found');
      }

      const data = subscriptionDoc.data();
      const currentUsage = data.analysisUsed || 0;

      if (currentUsage >= data.analysisCount) {
        throw new Error('Insufficient analysis credits');
      }

      // Update subscription with new usage count
      transaction.update(subscriptionRef, {
        analysisUsed: increment(1),
        lastAnalysisAt: serverTimestamp(),
        lastSyncedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
  } catch (error) {
    console.error('Error incrementing analysis count:', error);
    throw new Error('Failed to increment analysis count');
  }
}

export { app, auth, db };