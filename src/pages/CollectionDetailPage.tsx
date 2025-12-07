import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, FileText, MessageSquare, Star, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useReports, Report } from "@/contexts/ReportsContext";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const tipOptions = [
  { value: 2000, label: "$2.000" },
  { value: 5000, label: "$5.000" },
  { value: 10000, label: "$10.000" },
  { value: "custom", label: "Otro" },
];

// Helper functions for localStorage persistence
const STORAGE_KEY = "collection_ratings";

const getSavedRatings = (): Record<string, { rating: number; tip: number | null }> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const saveRating = (collectionId: string, data: { rating?: number; tip?: number | null }) => {
  const current = getSavedRatings();
  current[collectionId] = {
    rating: data.rating ?? current[collectionId]?.rating ?? 0,
    tip: data.tip !== undefined ? data.tip : current[collectionId]?.tip ?? null,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
};

const statusConfig: Record<string, { label: string; description: string; className: string; color: string }> = {
  pendiente: {
    label: "En espera de respuesta",
    description: "Un reciclador revisará tu solicitud pronto.",
    className: "bg-eco-yellow-light text-foreground",
    color: "text-eco-yellow",
  },
  aceptado: {
    label: "Aceptada",
    description: "Un reciclador recogerá tu plástico en la franja seleccionada.",
    className: "bg-eco-green-light text-primary",
    color: "text-primary",
  },
  recolectado: {
    label: "Recolectada",
    description: "¡Gracias por reciclar! Tu impacto hace la diferencia.",
    className: "bg-muted text-muted-foreground",
    color: "text-muted-foreground",
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

export default function CollectionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { reports, isLoading: reportsLoading } = useReports();

  const [report, setReport] = useState<Report | null>(null);
  const [address, setAddress] = useState("Cargando dirección...");
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedTip, setSelectedTip] = useState<number | string | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [hasRated, setHasRated] = useState(false);
  const [hasTipped, setHasTipped] = useState(false);
  const [savedTipAmount, setSavedTipAmount] = useState<number | null>(null);

  // Find report by id
  useEffect(() => {
    if (!id || reportsLoading) return;
    const found = reports.find((r) => r.rre_id.toString() === id);
    if (found) {
      setReport(found);
    }
  }, [id, reports, reportsLoading]);

  // Resolve address
  useEffect(() => {
    if (!report) return;

    if (report.rre_direccion_texto) {
      setAddress(report.rre_direccion_texto);
    } else if (report.rre_ubicacion_lat && report.rre_ubicacion_lng) {
      const fetchAddress = async () => {
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
              setAddress(shortAddress);
            }
          }
        } catch {
          setAddress("Dirección no disponible");
        }
      };
      fetchAddress();
    } else {
      setAddress("Dirección no disponible");
    }
  }, [report]);

  // Load saved rating data
  useEffect(() => {
    if (!report) return;

    const savedData = getSavedRatings()[report.rre_id.toString()];
    if (savedData) {
      if (savedData.rating) {
        setRating(savedData.rating);
        setHasRated(true);
      }
      if (savedData.tip !== null && savedData.tip !== undefined) {
        setSelectedTip(savedData.tip);
        setSavedTipAmount(savedData.tip);
        setHasTipped(true);
      }
    }
  }, [report]);

  if (reportsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4 flex items-center gap-4 z-50">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-display font-semibold text-foreground">Detalle de recolección</h1>
        </header>
        <div className="px-5 py-6 space-y-6">
          <Skeleton className="h-10 w-40 mx-auto" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Recolección no encontrada</p>
      </div>
    );
  }

  const status = statusConfig[report.rre_estado] || statusConfig.pendiente;
  const formattedDate = formatReportDate(report.rre_fecha_reporte);

  const handleSaveComment = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
    toast.success("Comentario guardado");
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error("Por favor selecciona una calificación");
      return;
    }
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    saveRating(report.rre_id.toString(), { rating });
    setIsSaving(false);
    setHasRated(true);
    toast.success("¡Gracias por tu calificación!");
  };

  const handleSendTip = async () => {
    const tipAmount = selectedTip === "custom" ? parseInt(customTip) : (selectedTip as number);
    if (!tipAmount || tipAmount <= 0) {
      toast.error("Por favor ingresa un monto válido");
      return;
    }
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    saveRating(report.rre_id.toString(), { tip: tipAmount });
    setIsSaving(false);
    setHasTipped(true);
    setSavedTipAmount(tipAmount);
    toast.success("¡Propina enviada al reciclador!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4 flex items-center gap-4 z-50">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors z-[60]"
          aria-label="Volver"
          type="button"
        >
          <ArrowLeft className="w-5 h-5 text-foreground pointer-events-none" />
        </button>
        <h1 className="text-lg font-display font-semibold text-foreground">Detalle de recolección</h1>
      </header>

      <div className="px-5 py-6 space-y-6 pb-24">
        {/* Status */}
        <section className="text-center animate-fade-up">
          <span className={cn("eco-badge text-base px-4 py-2", status.className)}>
            {status.label}
          </span>
          <p className="text-muted-foreground text-sm mt-3 max-w-xs mx-auto">
            {status.description}
          </p>
        </section>

        {/* Details */}
        <section className="eco-card space-y-4 animate-fade-up" style={{ animationDelay: "50ms" }}>
          <h2 className="font-display font-semibold text-foreground">Resumen</h2>

          <div className="space-y-3">
            <DetailRow icon={Clock} label="Fecha y hora">
              {formattedDate}
            </DetailRow>
            <DetailRow icon={FileText} label="Descripción">
              {report.rre_foto_descripcion || "Sin descripción"}
            </DetailRow>
            <DetailRow icon={MapPin} label="Dirección">
              {address}
            </DetailRow>
          </div>
        </section>

        {/* Comment Section - Only for pending/accepted */}
        {report.rre_estado !== "recolectado" && (
          <section className="eco-card space-y-3 animate-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-display font-semibold text-foreground">Comentario para el reciclador</h2>
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ej: Tocar el timbre del apto 301, dejar en portería..."
              className="eco-input min-h-[80px] resize-none"
            />
            <Button onClick={handleSaveComment} disabled={isSaving} className="w-full eco-button-primary">
              {isSaving ? "Guardando..." : "Guardar comentario"}
            </Button>
          </section>
        )}

        {/* Rating & Tip Section - Only for collected */}
        {report.rre_estado === "recolectado" && (
          <>
            {/* Star Rating */}
            <section className="eco-card space-y-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-display font-semibold text-foreground">Califica al reciclador</h2>
              </div>

              {hasRated ? (
                <div className="text-center py-4">
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-7 h-7",
                          star <= rating ? "fill-eco-yellow text-eco-yellow" : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm">¡Gracias por tu calificación!</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1.5 transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={cn(
                            "w-9 h-9 transition-colors",
                            star <= rating
                              ? "fill-eco-yellow text-eco-yellow"
                              : "text-muted-foreground hover:text-eco-yellow/50"
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <Button
                    onClick={handleSubmitRating}
                    disabled={isSaving || rating === 0}
                    className="w-full eco-button-primary"
                  >
                    {isSaving ? "Enviando..." : "Enviar calificación"}
                  </Button>
                </>
              )}
            </section>

            {/* Tip Section */}
            <section className="eco-card space-y-4 animate-fade-up" style={{ animationDelay: "150ms" }}>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <h2 className="font-display font-semibold text-foreground">Propina para el reciclador</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Tu propina ayuda a reconocer el trabajo de nuestros recicladores
              </p>

              {hasTipped ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-eco-green-light rounded-full flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-foreground font-semibold mb-1">
                    ${savedTipAmount?.toLocaleString("es-CO")}
                  </p>
                  <p className="text-muted-foreground text-sm">¡Propina enviada! Gracias por tu generosidad.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {tipOptions.map((tip) => (
                      <button
                        key={tip.value}
                        onClick={() => setSelectedTip(tip.value)}
                        className={cn(
                          "py-3 px-4 rounded-xl border-2 font-semibold transition-all",
                          selectedTip === tip.value
                            ? "border-primary bg-eco-green-light text-primary"
                            : "border-border bg-card text-foreground hover:border-primary/50"
                        )}
                      >
                        {tip.label}
                      </button>
                    ))}
                  </div>

                  {selectedTip === "custom" && (
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <input
                        type="number"
                        value={customTip}
                        onChange={(e) => setCustomTip(e.target.value)}
                        placeholder="Ingresa el monto"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border-2 border-border bg-card text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  )}

                  <Button
                    onClick={handleSendTip}
                    disabled={isSaving || !selectedTip || (selectedTip === "custom" && !customTip)}
                    className="w-full eco-button-primary"
                  >
                    {isSaving ? "Enviando..." : "Enviar propina"}
                  </Button>
                </>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

interface DetailRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}

function DetailRow({ icon: Icon, label, children }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-foreground font-medium">{children}</p>
      </div>
    </div>
  );
}
