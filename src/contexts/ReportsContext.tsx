import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

const REPORTS_STORAGE_KEY = "eco_reports";

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
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

// Load reports from localStorage
const loadReportsFromStorage = (userId: number): Report[] => {
  try {
    const stored = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (stored) {
      const allReports: Report[] = JSON.parse(stored);
      return allReports.filter((r) => r.usu_ciudadano_id === userId);
    }
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

  useEffect(() => {
    if (isAuthenticated && user?.user_id) {
      fetchReports();
    }
  }, [isAuthenticated, user?.user_id, fetchReports]);

  // Get the closest upcoming collection
  const upcomingCollection = (() => {
    if (reports.length === 0) return null;

    const now = new Date();
    
    // Filter reports that are in the future or today
    const upcomingReports = reports.filter((report) => {
      const reportDate = new Date(report.rre_fecha_reporte);
      return reportDate >= now;
    });

    if (upcomingReports.length === 0) {
      // If no future reports, get the most recent one
      return reports.reduce((closest, report) => {
        const reportDate = new Date(report.rre_fecha_reporte);
        const closestDate = new Date(closest.rre_fecha_reporte);
        return reportDate > closestDate ? report : closest;
      }, reports[0]);
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
