import { MobileLayout } from "@/components/layout/MobileLayout";
import { Clock, MapPin, Package, ChevronRight, Star, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useReports, Report } from "@/contexts/ReportsContext";
import { formatDateToSpanish, reverseGeocode } from "@/utils/formatters";
import { Skeleton } from "@/components/ui/skeleton";

// Helper to read saved ratings from localStorage
const STORAGE_KEY = "collection_ratings";

const getSavedRatings = (): Record<string, { rating: number; tip: number | null }> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

// Status config - Estados: ACEPTADO, EN_ESPERA, RECOGIDO
const statusConfig: Record<string, { label: string; className: string }> = {
  ACEPTADO: {
    label: "Aceptado",
    className: "bg-blue-100 text-blue-700",
  },
  EN_ESPERA: {
    label: "En espera",
    className: "bg-eco-yellow-light text-foreground",
  },
  RECOGIDO: {
    label: "Recogido",
    className: "bg-eco-green-light text-primary",
  },
};

export default function CollectionsPage() {
  const { reports, isLoading, refetchReports } = useReports();
  const [savedRatings, setSavedRatings] = useState<Record<string, { rating: number; tip: number | null }>>({});

  // Simple: refetch reports once on mount
  useEffect(() => {
    refetchReports();
    setSavedRatings(getSavedRatings());
  }, []);

  // Filter reports by status: EN_ESPERA for "Próximas", RECOGIDO for "Historial"
  const upcoming = reports.filter((r) => r.rre_estado === "EN_ESPERA");
  const history = reports.filter((r) => r.rre_estado === "RECOGIDO");

  return (
    <MobileLayout>
      <div className="px-5 py-6 space-y-6">
        {/* Header */}
        <header className="animate-fade-up">
          <h1 className="text-2xl font-display font-bold text-foreground">Recolecciones</h1>
          <p className="text-muted-foreground mt-1">Revisa el estado de tus solicitudes</p>
        </header>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-6">
            <section className="eco-section">
              <h2 className="eco-section-title">Próximas</h2>
              <div className="space-y-3">
                <CollectionCardSkeleton />
                <CollectionCardSkeleton />
              </div>
            </section>
          </div>
        )}

        {/* Upcoming */}
        {!isLoading && upcoming.length > 0 && (
          <section className="eco-section animate-fade-up" style={{ animationDelay: "50ms" }}>
            <h2 className="eco-section-title">Próximas</h2>
            <div className="space-y-3">
              {upcoming.map((report) => (
                <CollectionCard
                  key={report.rre_id}
                  report={report}
                  savedData={savedRatings[report.rre_id.toString()]}
                />
              ))}
            </div>
          </section>
        )}

        {/* History */}
        {!isLoading && (
          <section className="eco-section animate-fade-up" style={{ animationDelay: "100ms" }}>
            <h2 className="eco-section-title">Historial</h2>
            {history.length > 0 ? (
              <div className="space-y-3">
                {history.map((report) => (
                  <CollectionCard
                    key={report.rre_id}
                    report={report}
                    savedData={savedRatings[report.rre_id.toString()]}
                  />
                ))}
              </div>
            ) : (
              <div className="eco-card text-center py-8">
                <p className="text-muted-foreground">Aún no tienes recolecciones completadas</p>
              </div>
            )}
          </section>
        )}

        {/* Empty state */}
        {!isLoading && reports.length === 0 && (
          <div className="eco-card text-center py-8">
            <p className="text-muted-foreground">No tienes recolecciones registradas</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}

function CollectionCardSkeleton() {
  return (
    <div className="eco-card space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-5 w-5" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}

interface CollectionCardProps {
  report: Report;
  savedData?: { rating: number; tip: number | null };
}

function CollectionCard({ report, savedData }: CollectionCardProps) {
  const [address, setAddress] = useState<string>(report.rre_direccion_texto || "Cargando...");

  const statusKey = report.rre_estado?.toUpperCase() || "EN_ESPERA";
  const status = statusConfig[statusKey] || statusConfig.EN_ESPERA;
  const formattedDate = formatDateToSpanish(report.rre_fecha_reporte);
  const hasRating = savedData?.rating && savedData.rating > 0;
  const hasTip = savedData?.tip !== null && savedData?.tip !== undefined;

  useEffect(() => {
    if (report.rre_direccion_texto && report.rre_direccion_texto !== "string") {
      setAddress(report.rre_direccion_texto);
    } else if (report.rre_ubicacion_lat && report.rre_ubicacion_lng) {
      reverseGeocode(report.rre_ubicacion_lat, report.rre_ubicacion_lng)
        .then(setAddress)
        .catch(() => setAddress("Ubicación no disponible"));
    }
  }, [report.rre_direccion_texto, report.rre_ubicacion_lat, report.rre_ubicacion_lng]);

  return (
    <Link
      to={`/collections/${report.rre_id}`}
      className="eco-card block group hover:shadow-elevated transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn("eco-badge", status.className)}>{status.label}</span>
          {hasRating && (
            <span className="flex items-center gap-0.5 text-xs text-eco-yellow">
              <Star className="w-3.5 h-3.5 fill-eco-yellow" />
              {savedData?.rating}
            </span>
          )}
          {hasTip && (
            <span className="flex items-center gap-0.5 text-xs text-primary">
              <DollarSign className="w-3.5 h-3.5" />
              {savedData?.tip?.toLocaleString('es-CO')}
            </span>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-foreground font-medium">
          <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="w-4 h-4 flex-shrink-0" />
          <span>{report.rre_foto_descripcion || "Material reciclable"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{address}</span>
        </div>
      </div>
    </Link>
  );
}
