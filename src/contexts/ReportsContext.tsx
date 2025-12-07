import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

const REPORTS_STORAGE_KEY = "eco_reports";
const FIRST_TIME_KEY = "eco_first_time_initialized";

export interface Report {
  rre_id: number;
  usu_ciudadano_id: number;
  usu_reciclador_id: number;
  tma_id: number;
  rre_cantidad_kg: string;
  rre_foto_url: string;
  rre_foto_descripcion: string;
  rre_ubicacion_lat: string;
  rre_ubicacion_lng: string;
  rre_direccion_texto: string;
  rre_estado: string;
  rre_fecha_reporte: string;
  rre_fecha_recogida?: string;
  rre_puntos_otorgados: number;
}

interface ReportsContextType {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  refetchReports: () => Promise<void>;
  upcomingCollection: Report | null;
  addReport: (reportData: Omit<Report, "rre_id">) => Report;
  deleteReport: (reportId: number) => void;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

// Generate default reports for a user
const generateDefaultReports = (userId: number): Report[] => {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const dec14 = new Date(2024, 11, 14, 10, 0, 0); // December 14, 2024

  return [
    {
      rre_id: 1,
      usu_ciudadano_id: userId,
      usu_reciclador_id: 1,
      tma_id: 1,
      rre_cantidad_kg: "2.50",
      rre_foto_url: "",
      rre_foto_descripcion: "Botellas PET recicladas",
      rre_ubicacion_lat: "4.6201",
      rre_ubicacion_lng: "-74.1901",
      rre_direccion_texto: "Calle 73 Sur #80C-21, El Regalo, Bosa, Bogotá",
      rre_estado: "RECOGIDO",
      rre_fecha_reporte: oneWeekAgo.toISOString(),
      rre_fecha_recogida: oneWeekAgo.toISOString(),
      rre_puntos_otorgados: 50,
    },
    {
      rre_id: 2,
      usu_ciudadano_id: userId,
      usu_reciclador_id: 1,
      tma_id: 2,
      rre_cantidad_kg: "1.20",
      rre_foto_url: "",
      rre_foto_descripcion: "Plásticos para reciclar",
      rre_ubicacion_lat: "4.6201",
      rre_ubicacion_lng: "-74.1901",
      rre_direccion_texto: "Carrera 80 #68-45, Kennedy, Bogotá",
      rre_estado: "ACEPTADO",
      rre_fecha_reporte: dec14.toISOString(),
      rre_puntos_otorgados: 25,
    },
  ];
};

// Check if it's the first time for this user
const isFirstTime = (userId: number): boolean => {
  try {
    const key = `${FIRST_TIME_KEY}_${userId}`;
    return !localStorage.getItem(key);
  } catch (e) {
    return true;
  }
};

// Mark user as initialized
const markAsInitialized = (userId: number) => {
  try {
    const key = `${FIRST_TIME_KEY}_${userId}`;
    localStorage.setItem(key, "true");
  } catch (e) {
    console.error("Error marking user as initialized:", e);
  }
};

// Load reports from localStorage
const loadReportsFromStorage = (userId: number): Report[] => {
  try {
    const stored = localStorage.getItem(REPORTS_STORAGE_KEY);
    let allReports: Report[] = stored ? JSON.parse(stored) : [];
    
    // Only create default reports on first time
    if (isFirstTime(userId)) {
      const defaultReports = generateDefaultReports(userId);
      allReports = [...allReports, ...defaultReports];
      saveReportsToStorage(allReports);
      markAsInitialized(userId);
    }
    
    return allReports.filter((r) => r.usu_ciudadano_id === userId);
  } catch (e) {
    console.error("Error loading reports from storage:", e);
  }
  return [];
};

// Save reports to localStorage
const saveReportsToStorage = (reports: Report[]) => {
  try {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  } catch (e) {
    console.error("Error saving reports to storage:", e);
  }
};

// Get all reports from storage (for adding new ones)
const getAllReportsFromStorage = (): Report[] => {
  try {
    const stored = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Error loading all reports from storage:", e);
  }
  return [];
};

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchReports = useCallback(async () => {
    if (!user?.user_id) return;

    setIsLoading(true);
    setError(null);

    // Load from localStorage
    const storedReports = loadReportsFromStorage(user.user_id);
    setReports(storedReports);
    setIsLoading(false);
  }, [user?.user_id]);

  const addReport = useCallback((reportData: Omit<Report, "rre_id">): Report => {
    const allReports = getAllReportsFromStorage();
    
    // Generate new ID
    const maxId = allReports.length > 0 
      ? Math.max(...allReports.map(r => r.rre_id)) 
      : 0;
    
    const newReport: Report = {
      ...reportData,
      rre_id: maxId + 1,
    };

    // Add to all reports and save
    const updatedAllReports = [...allReports, newReport];
    saveReportsToStorage(updatedAllReports);

    // Update state with user's reports
    if (user?.user_id) {
      const userReports = updatedAllReports.filter(r => r.usu_ciudadano_id === user.user_id);
      setReports(userReports);
    }

    return newReport;
  }, [user?.user_id]);

  const deleteReport = useCallback((reportId: number) => {
    const allReports = getAllReportsFromStorage();
    const updatedReports = allReports.filter(r => r.rre_id !== reportId);
    saveReportsToStorage(updatedReports);

    // Update state with user's reports
    if (user?.user_id) {
      const userReports = updatedReports.filter(r => r.usu_ciudadano_id === user.user_id);
      setReports(userReports);
    }
  }, [user?.user_id]);

  useEffect(() => {
    if (isAuthenticated && user?.user_id) {
      fetchReports();
    }
  }, [isAuthenticated, user?.user_id, fetchReports]);

  // Get the closest upcoming collection (only ACEPTADO status)
  const upcomingCollection = (() => {
    if (reports.length === 0) return null;

    const now = new Date();
    
    // Filter only ACEPTADO reports
    const acceptedReports = reports.filter((report) => report.rre_estado === "ACEPTADO");
    
    if (acceptedReports.length === 0) return null;

    // Filter reports that are in the future or today
    const upcomingReports = acceptedReports.filter((report) => {
      const reportDate = new Date(report.rre_fecha_reporte);
      return reportDate >= now;
    });

    if (upcomingReports.length === 0) {
      // If no future reports, get the most recent accepted one
      return acceptedReports.reduce((closest, report) => {
        const reportDate = new Date(report.rre_fecha_reporte);
        const closestDate = new Date(closest.rre_fecha_reporte);
        return reportDate > closestDate ? report : closest;
      }, acceptedReports[0]);
    }

    // Get the closest future report
    return upcomingReports.reduce((closest, report) => {
      const reportDate = new Date(report.rre_fecha_reporte);
      const closestDate = new Date(closest.rre_fecha_reporte);
      return reportDate < closestDate ? report : closest;
    }, upcomingReports[0]);
  })();

  return (
    <ReportsContext.Provider
      value={{
        reports,
        isLoading,
        error,
        refetchReports: fetchReports,
        upcomingCollection,
        addReport,
        deleteReport,
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
}

export function useReports() {
  const context = useContext(ReportsContext);
  if (context === undefined) {
    throw new Error("useReports must be used within a ReportsProvider");
  }
  return context;
}
