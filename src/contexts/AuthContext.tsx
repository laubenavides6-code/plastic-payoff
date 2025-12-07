import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type UserRole = "ciudadano" | "acopio" | null;

interface User {
  id: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (identification: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for development
const MOCK_USERS = [
  { id: "1", identification: "ciudadano", password: "password123", role: "ciudadano" as const },
  { id: "2", identification: "acopio", password: "password123", role: "acopio" as const },
];

const AUTH_STORAGE_KEY = "eco_auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const login = async (identification: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const foundUser = MOCK_USERS.find(
      u => u.identification === identification && u.password === password
    );

    if (foundUser) {
      const userData = { id: foundUser.id, role: foundUser.role };
      setUser(userData);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      return { success: true };
    }

    return { success: false, error: "Credenciales incorrectas" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
