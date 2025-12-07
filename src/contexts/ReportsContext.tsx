import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = "https://ecogiro.jdxico.easypanel.host";

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
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export function ReportsProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const fetchReports = async () => {
    if (!user?.user_id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/reportes/?usuario_id=${user.user_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.detail?.[0]?.msg || data.detail || "Error al obtener reportes";
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error #1",
          description: errorMessage,
        });
        return;
      }

      setReports(data);
    } catch (err) {
      console.error("Reports fetch error:", err);
      const errorMessage = "Error de conexión. Intenta de nuevo.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error #1",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.user_id) {
      fetchReports();
    }
  }, [isAuthenticated, user?.user_id]);

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
