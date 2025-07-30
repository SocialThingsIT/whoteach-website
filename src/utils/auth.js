import { atom } from 'nanostores';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { USER_ROLES } from './roles';

export const user = atom(null);
export const userRole = atom(null);
export const isLoading = atom(true);

const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  
  try {
    const snapShot = await getDoc(userRef);
    
    if (!snapShot.exists()) {
      const { email, uid } = user;
      const createdAt = new Date();
      const defaultRole = USER_ROLES.STUDENT;
      
      await setDoc(userRef, {
        email,
        uid,
        role: defaultRole,
        createdAt,
        ...additionalData
      });
      
      return { role: defaultRole };
    } else {
      return snapShot.data();
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
};

const getUserProfile = async (userId) => {
  if (!userId) return null;
  
  try {
    const userRef = doc(db, 'users', userId);
    const snapShot = await getDoc(userRef);
    
    if (snapShot.exists()) {
      return snapShot.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    const userProfile = await getUserProfile(firebaseUser.uid);
    
    if (userProfile) {
      user.set({
        ...firebaseUser,
        role: userProfile.role,
        profile: userProfile
      });
      userRole.set(userProfile.role);
    } else {
      const newProfile = await createUserProfile(firebaseUser);
      user.set({
        ...firebaseUser,
        role: newProfile?.role || USER_ROLES.STUDENT,
        profile: newProfile
      });
      userRole.set(newProfile?.role || USER_ROLES.STUDENT);
    }
  } else {
    user.set(null);
    userRole.set(null);
  }
  isLoading.set(false);
});

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: translateFirebaseError(error) };
  }
};

export const signUp = async (email, password, additionalData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const userProfile = await createUserProfile(userCredential.user, additionalData);
    
    return { 
      success: true, 
      user: userCredential.user,
      profile: userProfile
    };
  } catch (error) {
    return { success: false, error: translateFirebaseError(error) };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: translateFirebaseError(error) };
  }
};

export const updateUserRole = async (userId, newRole) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { role: newRole }, { merge: true });
    
    if (auth.currentUser?.uid === userId) {
      const currentUser = user.get();
      user.set({
        ...currentUser,
        role: newRole,
        profile: { ...currentUser.profile, role: newRole }
      });
      userRole.set(newRole);
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const translateFirebaseError = (error) => {
  const errorMessages = {
    'auth/user-not-found': 'Utente non trovato',
    'auth/wrong-password': 'Password errata',
    'auth/email-already-in-use': 'Email già in uso',
    'auth/weak-password': 'Password troppo debole (minimo 6 caratteri)',
    'auth/invalid-email': 'Email non valida',
    'auth/too-many-requests': 'Troppi tentativi falliti. Riprova più tardi',
    'auth/network-request-failed': 'Errore di connessione. Verifica la tua connessione internet'
  };
  
  return errorMessages[error.code] || error.message;
};