import { createContext, useContext, useEffect, useState } from "react";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, onAuthStateChanged } from "@/lib/firebase";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Regga med email och lösenord
  const signUp = async (email, password) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  // Logga in med email och lösenord
  const logIn = async (email, password) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Logga in med google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  // Logga ut
  const logOut = async () => {
    await signOut(auth);
  };

  // Återställ lösenord
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Updattera användarprofiler
  const updateUserProfile = async (displayName) => {
    if (auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName });
    }
  };

  const value = {
    currentUser,
    loading,
    signUp,
    logIn,
    logOut,
    resetPassword,
    updateUserProfile,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 