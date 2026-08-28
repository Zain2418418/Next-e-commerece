import { 
  signInWithPopup, 
  linkWithPopup, 
  UserCredential 
} from "firebase/auth";
import { ref, get, set, update } from "firebase/database";
import { auth, googleProvider, db } from "./firebase";

/**
 * 1️⃣ Realtime Database aur LocalStorage mein User Sync
 */
export const syncUserProfile = async (user: any) => {
  const userRef = ref(db, `users/${user.uid}`);
  const snapshot = await get(userRef);

  const userData = {
    uid: user.uid,
    name: user.displayName || "User",
    email: user.email,
    photoURL: user.photoURL || "",
    provider: user.providerData.map((p: any) => p.providerId),
    lastLogin: new Date().toISOString(),
  };

  if (!snapshot.exists()) {
    // Naya user automatic create ho raha hai
    await set(userRef, {
      ...userData,
      createdAt: new Date().toISOString(),
      role: "customer",
    });
  } else {
    // Existing user profile metadata update
    await update(userRef, userData);
  }

  // Session state ke liye LocalStorage update
  localStorage.setItem("user", JSON.stringify(userData));
};

/**
 * 2️⃣ Google Sign-In / Auto-Register Handler
 */
export const handleGoogleSignIn = async () => {
  try {
    // Account selection prompt ensure karne ke liye
    googleProvider.setCustomParameters({ prompt: "select_account" });

    const result: UserCredential = await signInWithPopup(auth, googleProvider);
    await syncUserProfile(result.user);
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error("Google Auth Error:", error);

    // Popup block specific error handle
    if (error.code === "auth/popup-blocked") {
      return { 
        success: false, 
        message: "Popup was blocked by your browser. Please allow popups for this site and try again." 
      };
    }

    if (error.code === "auth/popup-closed-by-user") {
      return { 
        success: false, 
        message: "Sign-in popup was closed before completing." 
      };
    }

    return { success: false, message: error.message || "Google Login Failed" };
  }
};

/**
 * 3️⃣ Existing Account ke sath Google Link karne ka function
 */
export const linkGoogleAccount = async () => {
  try {
    if (!auth.currentUser) {
      throw new Error("No user is currently logged in.");
    }
    
    googleProvider.setCustomParameters({ prompt: "select_account" });
    const result = await linkWithPopup(auth.currentUser, googleProvider);
    await syncUserProfile(result.user);
    
    return { success: true, user: result.user };
  } catch (error: any) {
    console.error("Link Account Error:", error);
    return { 
      success: false, 
      message: error.message || "Failed to link Google account." 
    };
  }
};