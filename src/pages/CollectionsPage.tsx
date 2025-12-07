import { MobileLayout } from "@/components/layout/MobileLayout";
import { Clock, MapPin, ChevronRight, Star, DollarSign, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useReports, Report } from "@/contexts/ReportsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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

const statusConfig: Record<string, { label: string; className: string }> = {
  pendiente: {
    label: "En espera",
    className: "bg-eco-yellow-light text-foreground",
  },
  aceptado: {
    label: "Aceptada",
    className: "bg-eco-green-light text-primary",
  },
  recolectado: {
    label: "Recolectada",
    className: "bg-muted text-muted-foreground",
  },
};

// Format date from ISO to "Domingo 7 diciembre - 14:00"
const formatReportDate = (isoDate: string): string => {
  try {
    const date = new Date(isoDate);
    const dayName = format(date, "EEEE", { locale: es });
    const dayNumber = format(date, "d", { locale: es });
    const month = format(date, "MMMM", { locale: es });
    const time = format(date, "HH:mm", { locale: es });
    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dayNumber} ${month} - ${time}`;
  } catch {
    return isoDate;
  }
};

export default function CollectionsPage() {
  const { reports, isLoading } = useReports();
  const [savedRatings, setSavedRatings] = useState<Record<string, { rating: number; tip: number | null }>>({});
  const [addresses, setAddresses] = useState<Record<number, string>>({});

  useEffect(() => {
    setSavedRatings(getSavedRatings());
  }, []);

  // Reverse geocode addresses for reports
  useEffect(() => {
    const fetchAddresses = async () => {
      for (const report of reports) {
        if (report.rre_direccion_texto) {
          setAddresses(prev => ({ ...prev, [report.rre_id]: report.rre_direccion_texto }));
        } else if (report.rre_ubicacion_lat && report.rre_ubicacion_lng) {
          try {
            const lat = parseFloat(report.rre_ubicacion_lat);
            const lng = parseFloat(report.rre_ubicacion_lng);
            if (!isNaN(lat) && !isNaN(lng)) {
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
              );
              const data = await response.json();
              if (data.display_name) {
                const shortAddress = data.display_name.split(",").slice(0, 3).join(", ");
                setAddresses(prev => ({ ...prev, [report.rre_id]: shortAddress }));
              }
            }
          } catch {
            setAddresses(prev => ({ ...prev, [report.rre_id]: "Dirección no disponible" }));
          }
        }
      }
    };

    if (reports.length > 0) {
      fetchAddresses();
    }
  }, [reports]);

  const upcoming = reports.filter((r) => r.rre_estado !== "recolectado");
  const history = reports.filter((r) => r.rre_estado === "recolectado");

  if (isLoading) {
    return (
      <MobileLayout>
        <div className="px-5 py-6 space-y-6">
          <header className="animate-fade-up">
            <h1 className="text-2xl font-display font-bold text-foreground">Recolecciones</h1>
            <p className="text-muted-foreground mt-1">Revisa el estado de tus solicitudes</p>
          </header>
          <section className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </section>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="px-5 py-6 space-y-6">
        {/* Header */}
        <header className="animate-fade-up">
          <h1 className="text-2xl font-display font-bold text-foreground">Recolecciones</h1>
          <p className="text-muted-foreground mt-1">Revisa el estado de tus solicitudes</p>
        </header>

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className="eco-section animate-fade-up" style={{ animationDelay: "50ms" }}>
            <h2 className="eco-section-title">Próximas</h2>
            <div className="space-y-3">
              {upcoming.map((report) => (
                <CollectionCard
                  key={report.rre_id}
                  report={report}
                  address={addresses[report.rre_id] || "Cargando dirección..."}
                  savedData={savedRatings[report.rre_id.toString()]}
                />
              ))}
            </div>
          </section>
        )}

        {/* History */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "100ms" }}>
          <h2 className="eco-section-title">Historial</h2>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((report) => (
                <CollectionCard
                  key={report.rre_id}
                  report={report}
                  address={addresses[report.rre_id] || "Cargando dirección..."}
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
      </div>
    </MobileLayout>
  );
}

interface CollectionCardProps {
  report: Report;
  address: string;
  savedData?: { rating: number; tip: number | null };
}

function CollectionCard({ report, address, savedData }: CollectionCardProps) {
  const status = statusConfig[report.rre_estado] || statusConfig.pendiente;
  const hasRating = savedData?.rating && savedData.rating > 0;
  const hasTip = savedData?.tip !== null && savedData?.tip !== undefined;
  const formattedDate = formatReportDate(report.rre_fecha_reporte);

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
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span className="truncate">{report.rre_foto_descripcion || "Sin descripción"}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{address}</span>
        </div>
      </div>
    </Link>
  );
}
