import axios from "axios";
import { auth } from "./firebaseConfig";

const apiClient = axios.create({
  // ✅ Dynamically reads from Vercel in production, or defaults to local C# backend
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5167/api",
});

apiClient.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;