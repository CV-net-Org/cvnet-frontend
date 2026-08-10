import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "cvnet-admin-session";
const ADMIN_CREDENTIALS = {
  email: "admin@cvnet.local",
  password: "admin123",
  name: "Admin",
};

type AdminSession = {
  email: string;
  name: string;
};

type AdminAuthContextValue = {
  session: AdminSession | null;
  isReady: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSession(JSON.parse(raw) as AdminSession);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  const value = useMemo<AdminAuthContextValue>(() => {
    return {
      session,
      isReady,
      isAuthenticated: Boolean(session),
      login: async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPassword = password.trim();

        if (
          normalizedEmail !== ADMIN_CREDENTIALS.email ||
          normalizedPassword !== ADMIN_CREDENTIALS.password
        ) {
          throw new Error("Invalid admin email or password.");
        }

        const nextSession = {
          email: ADMIN_CREDENTIALS.email,
          name: ADMIN_CREDENTIALS.name,
        };

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
        setSession(nextSession);
      },
      logout: () => {
        window.localStorage.removeItem(STORAGE_KEY);
        setSession(null);
      },
    };
  }, [isReady, session]);

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}
