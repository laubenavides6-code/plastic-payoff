import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type UserRole = "CIUDADANO" | "CENTRO_DE_ACOPIO" | null;

interface UserData {
  user_id: number;
  rol: UserRole;
  nombres: string;
  apellidos: string;
  telefono: string;
  puntos_acumulados: number;
  nivel_gamificacion: number;
}

interface AuthContextType {
  user: UserData | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = "http://54.227.255.141:54322";
const AUTH_STORAGE_KEY = "eco_auth_user";

const formatRole = (rol: string): UserRole => {
  const normalized = rol.toLowerCase().trim();
  if (normalized === "ciudadano") return "CIUDADANO";
  if (normalized === "centro de acopio") return "CENTRO_DE_ACOPIO";
  return "CIUDADANO"; // Default fallback
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response
        const errorMessage = data.detail?.[0]?.msg || "Error al iniciar sesión";
        return { success: false, error: errorMessage };
      }

      // Format role and create user data
      const userData: UserData = {
        user_id: data.user_id,
        rol: formatRole(data.rol),
        nombres: data.nombres,
        apellidos: data.apellidos,
        telefono: data.telefono,
        puntos_acumulados: data.puntos_acumulados,
        nivel_gamificacion: data.nivel_gamificacion,
      };

      setUser(userData);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Error de conexión. Intenta de nuevo." };
    }
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
