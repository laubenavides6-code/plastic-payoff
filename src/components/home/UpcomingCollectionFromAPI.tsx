import { Clock, MapPin, Package, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Report } from "@/contexts/ReportsContext";
import { formatDateToSpanish, reverseGeocode } from "@/utils/formatters";
import { useEffect, useState } from "react";

interface UpcomingCollectionFromAPIProps {
  report: Report;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ASIGNADO: {
    label: "Asignado",
    className: "bg-eco-green-light text-primary",
  },
  PENDIENTE: {
    label: "En espera",
    className: "bg-eco-yellow-light text-foreground",
  },
  RECOGIDO: {
    label: "Recogido",
    className: "bg-muted text-muted-foreground",
  },
};

export function UpcomingCollectionFromAPI({ report }: UpcomingCollectionFromAPIProps) {
  const [address, setAddress] = useState<string>(report.rre_direccion_texto || "Cargando dirección...");
  
  const statusKey = report.rre_estado?.toUpperCase() || "PENDIENTE";
  const status = statusConfig[statusKey] || statusConfig.PENDIENTE;
  const formattedDate = formatDateToSpanish(report.rre_fecha_reporte);

  useEffect(() => {
    // If we have a text address, use it; otherwise try to reverse geocode
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
      className="eco-card block space-y-3 group hover:shadow-elevated transition-shadow duration-200"
    >
      <div className="flex items-center justify-end">
        <span className={cn("eco-badge", status.className)}>{status.label}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 flex-shrink-0" />
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

      <div className="flex items-center justify-end gap-1 text-sm text-primary font-medium pt-1">
        Ver detalles
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
