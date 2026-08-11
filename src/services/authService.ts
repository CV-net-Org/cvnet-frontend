import { auth } from "@/lib/firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import apiClient from "@/lib/apiClient";

export const authService = {
  async signUp(firstName: string, lastName: string, email: string, pass: string, role: string, agreement: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`.trim()
      });
      
      return await apiClient.post("/Auth/signup", {
        uid: userCredential.user.uid,
        email: email,
        firstName: firstName, 
        lastName: lastName,   
        role: role,
        agreement: agreement
      });
      
    } catch (error: any) {
      console.error("AuthService Exception Caught:", error);
      
      if (error.response) {
        throw error; 
      } else if (error.code) {
        throw error; 
      }
      
      throw new Error(error.message || "An unknown error occurred during authentication.");
    }
  },

  async login(email: string, pass: string) {
    console.log(`[DEBUG-FRONTEND] Starting email login for: ${email}`);
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const idToken = await userCredential.user.getIdToken();
    console.log(`[DEBUG-FRONTEND] Firebase auth successful. Token snippet: ${idToken.substring(0, 15)}...`);
    
    try {
      console.log(`[DEBUG-FRONTEND] Sending POST request to /Auth/login`);
      
      // Token header is handled by apiClient; idToken remains in the body
      const response = await apiClient.post("/api/Auth/login", { idToken });
      
      console.log(`[DEBUG-FRONTEND] Backend accepted token. Response:`, response.data);
      return response;
    } catch (error: any) {
      console.error(`[DEBUG-FRONTEND] ❌ Backend rejected the login request!`);
      if (error.response) {
        console.error(`[DEBUG-FRONTEND] Status Code: ${error.response.status}`);
        console.error(`[DEBUG-FRONTEND] Error Data:`, error.response.data);
      } else {
        console.error(`[DEBUG-FRONTEND] Network/Axios Error:`, error.message);
      }
      throw error;
    }
  },

  async loginWithGoogle(agreement?: string) {
    console.log(`[DEBUG-FRONTEND] Starting Google login`);
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    console.log(`[DEBUG-FRONTEND] Google auth successful. Token snippet: ${idToken.substring(0, 15)}...`);

    try {
      console.log(`[DEBUG-FRONTEND] Sending POST request to /Auth/login`);
      
      const response = await apiClient.post("/Auth/login", { 
        idToken,
        agreement: agreement || "Agreed" 
      });
      
      console.log(`[DEBUG-FRONTEND] Backend accepted Google token. Response:`, response.data);
      return response;
    } catch (error: any) {
      console.error(`[DEBUG-FRONTEND] ❌ Backend rejected the Google login request!`);
      if (error.response) {
        console.error(`[DEBUG-FRONTEND] Status Code: ${error.response.status}`);
        console.error(`[DEBUG-FRONTEND] Error Data:`, error.response.data);
      } else {
        console.error(`[DEBUG-FRONTEND] Network/Axios Error:`, error.message);
      }
      throw error;
    }
  }
};