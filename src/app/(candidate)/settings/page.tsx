"use client";

import { useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  updatePassword, 
  updateProfile,
  EmailAuthProvider, 
  reauthenticateWithCredential,
  signOut, 
  updateEmail, 
  User as FirebaseUser 
} from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";
import axios from "axios";
import {
  Camera,
  Shield,
  Bell,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  CheckCircle2,
  Lock,
  Globe
} from "lucide-react";
import apiClient from "@/lib/apiClient";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsPage() {
  const { isDark } = useTheme();
  // Auth & Profile States - Cleaned up to use a single Full Name source of truth
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [isEmailUser, setIsEmailUser] = useState(true);

  // Security UI Input States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Structural Processing States
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string | null }>({
    type: "success",
    text: null,
  });

  // Load Contexts upon Component Setup
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        
        // Use the native Firebase displayName as the single source of truth
        setFullName(user.displayName || "");
        setEmail(user.email || "");
        setProfileImageUrl(user.photoURL || null);

        const provider = user.providerData.some((p) => p.providerId === "password");
        setIsEmailUser(provider);
      }
    });
    return () => unsubscribe();
  }, []);

  // Compute initials cleanly from a single string
  const getInitials = (name: string) => {
    if (!name) return "CV";
    return name
      .trim()
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  /**
   * 1. Profile Core Field Update Operation
   */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setIsLoading(true);
    setStatusMessage({ type: "success", text: null });

    try {
      // 1. Update Firebase Auth Context
      if (fullName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName: fullName });
      }

      if (email !== currentUser.email) {
        await updateEmail(currentUser, email);
      }

      // 2. Transmit standard payload to .NET (Backend handles the NoSQL splitting)
      await apiClient.put("/api/Profile/update-details", {
        fullName: fullName,
        email: email
      });

      setStatusMessage({ type: "success", text: "Profile base information updated successfully!" });
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        setStatusMessage({
          type: "error",
          text: "Security sensitive operation. Please log out and log back in to renew your security context.",
        });
      } else {
        setStatusMessage({ type: "error", text: error.message || "Failed to finalize profile modifications." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 2. Multpart Form Image Core Binary Upload Relay
   */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatusMessage({ type: "error", text: "File size threshold breached. Maximum file size allowed is 5MB." });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: "success", text: null });

    const multipartForm = new FormData();
    multipartForm.append("file", file);

    try {
      const response = await apiClient.post("/api/Profile/upload-image", multipartForm);

      if (response.data.status === "success") {
        const structuralCloudinaryUrl = response.data.imageUrl;
        await updateProfile(currentUser, { photoURL: structuralCloudinaryUrl });
        setProfileImageUrl(structuralCloudinaryUrl);
        setStatusMessage({ type: "success", text: "Professional profile avatar uploaded and synchronized successfully!" });
      }
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        text: error.response?.data?.message || error.message || "Failed to complete data pipeline asset upload.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 3. Identity Credential Rotation Routine
   */
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !currentUser.email) return;

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: "error", text: "Password mismatch error. Confirm value must match exactly." });
      return;
    }

    if (newPassword.length < 6) {
      setStatusMessage({ type: "error", text: "Password complexity minimum threshold unmet (Min 6 characters)." });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: "success", text: null });

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      await updatePassword(currentUser, newPassword);

      setStatusMessage({ type: "success", text: "Account credentials rotated successfully!" });
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword(""); 
    } catch (error: any) {
      setStatusMessage({ type: "error", text: error.message || "Failed to complete password shift operations." });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 4. Master Account Deletion Routine
   */
  const handleDeactivateAccount = async () => {
    if (!currentUser) return;

    const isConfirmed = window.confirm(
      "🚨 CRITICAL WARNING 🚨\n\nAre you absolutely sure you want to delete your account?\nThis action is PERMANENT and will destroy your profile, application history, and all data across our systems. This cannot be undone."
    );

    if (!isConfirmed) return;

    setIsLoading(true);
    try {
      await apiClient.delete("/api/User/delete-account");

      await signOut(auth);
      window.location.href = "/login";
    } catch (error: any) {
      setStatusMessage({
        type: "error",
        text: error.response?.data?.error || error.message || "Failed to delete account.",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className={`p-6 sm:p-8 max-w-4xl min-h-screen ${isDark ? 'bg-slate-950' : ''}`}>
      {/* Header Context Bar */}
      <div className="mb-8">
        <h1 className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>Account Settings</h1>
        <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Manage your account information, security settings, and communication preferences.
        </p>
      </div>

      {/* Global Realtime System Operations Feedback Banner */}
      {statusMessage.text && (
        <div
          className={`flex items-start gap-2.5 border rounded-xl p-4 text-sm mb-6 transition-all animate-in fade-in-50 duration-200 ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {statusMessage.type === "success" ? <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />}
          <div className="font-medium">{statusMessage.text}</div>
        </div>
      )}

      {/* Dynamic User Summary Badge Context */}
      <div className={`flex items-center gap-4 p-4 rounded-2xl shadow-sm mb-6 border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        {profileImageUrl ? (
          <img src={profileImageUrl} alt="Avatar" className={`w-12 h-12 rounded-full object-cover flex-shrink-0 border ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />
        ) : (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-600'}`}>
            {getInitials(fullName)}
          </div>
        )}
        <div>
          <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{fullName || "CVNet User"}</p>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Candidate Account</p>
        </div>
      </div>

      {/* Component Core Segment Tab Navigation Controllers */}
      <div className={`flex gap-1 mb-6 p-1 rounded-xl w-fit flex-wrap ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
        {[
          { key: "profile", label: "Profile Information" },
          { key: "security", label: "Security Gateway" },
          { key: "notifications", label: "System Alerts" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key as any)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === key ? (isDark ? "bg-slate-800 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm") : (isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-700")
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* TAB LAYER 1: Core Profile Handling Form */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className={`border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-5">
              <Camera size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <h2 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Profile Information</h2>
            </div>
            <p className={`text-sm mb-5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Update your personal details and how others see you.</p>

            {/* Profile Avatar Binary Pipeline Trigger Component */}
            <div className={`flex items-center gap-5 mb-6 pb-6 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="relative">
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Avatar" className={`w-20 h-20 rounded-full object-cover border ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />
                ) : (
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center font-bold text-2xl ${isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-600 text-white'}`}>
                    {getInitials(fullName)}
                  </div>
                )}
                <label className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md border-2 transition-colors cursor-pointer ${isDark ? 'bg-blue-600 border-slate-900 hover:bg-blue-500' : 'bg-blue-600 border-white hover:bg-blue-700'}`}>
                  <Camera size={13} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isLoading} />
                </label>
              </div>
              <div>
                <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Profile Picture</p>
                <p className={`text-xs mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>JPG, GIF or PNG. Recommended size 400x400px.</p>
                <div className="flex gap-2">
                  <label className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors border cursor-pointer ${isDark ? 'bg-blue-900/30 text-blue-400 border-blue-900/50 hover:bg-blue-900/50' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'}`}>
                    Upload New
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isLoading} />
                  </label>
                </div>
              </div>
            </div>

            {/* Restored to a Professional Single Full Name Input */}
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:bg-slate-800' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:bg-slate-800' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm disabled:opacity-50"
            >
              <Save size={15} /> {isLoading ? "Processing..." : "Save Changes"}
            </button>
          </form>
        )}

        {/* TAB LAYER 2: Advanced Identity Security Gateway */}
        {activeTab === "security" && (
          <div className={`border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-5">
              <Shield size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <h2 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Security</h2>
            </div>
            <p className={`text-sm mb-5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Secure your account with a strong password.</p>

            {isEmailUser ? (
              <form onSubmit={handleUpdatePassword}>
                <h3 className={`text-sm font-bold mb-4 ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>Change Password</h3>
                <div className="space-y-3 mb-5">
                  
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="Enter current password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className={`w-full px-4 pr-12 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:bg-slate-800' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="Enter new password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full px-4 pr-12 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:bg-slate-800' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:bg-slate-800' : 'bg-slate-50 border-slate-200 focus:bg-white'}`}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors mb-6 disabled:opacity-50"
                >
                  <Lock size={15} /> {isLoading ? "Rotating..." : "Update Password"}
                </button>
              </form>
            ) : (
              <div className={`flex flex-col items-center justify-center border border-dashed rounded-2xl p-8 text-center max-w-xl mx-auto my-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                  <Globe size={24} />
                </div>
                <h4 className={`font-bold text-base mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Single Sign-On (SSO) Account</h4>
                <p className={`text-sm max-w-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  You are securely logged into CVNet using your **Google identity provider channel**. Internal password rotation is managed externally within your primary Google Account management dashboard.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB LAYER 3: System Notifications & Alerts Shell */}
        {activeTab === "notifications" && (
          <div className={`border rounded-2xl p-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center gap-2 mb-5">
              <Bell size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <h2 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Notifications & Preferences</h2>
            </div>
            <p className={`text-sm mb-5 ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
              Choose how you want to be notified about job opportunities and application updates.
            </p>
            <div className={`border border-dashed rounded-xl p-8 text-center text-sm font-medium ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
              Notification synchronization configuration interface handles will hook into system sockets during next phase development cycles.
            </div>
          </div>
        )}

        {/* System Safety Border: Danger Zone */}
        <div className={`border rounded-2xl p-6 ${isDark ? 'bg-red-950/20 border-red-900/30' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-600" />
            <h2 className={`font-bold ${isDark ? 'text-red-500' : 'text-red-800'}`}>Deactivate Account</h2>
          </div>
          <p className={`text-sm mb-4 ${isDark ? 'text-red-400/80' : 'text-red-600'}`}>
            Once you deactivate your account, your profile and application history will be hidden from recruiters.
          </p>
          
          <button 
            type="button" 
            onClick={handleDeactivateAccount}
            disabled={isLoading}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <AlertTriangle size={15} /> {isLoading ? "Deactivating..." : "Deactivate"}
          </button>
        </div>

      </div>
    </div>
  );
}