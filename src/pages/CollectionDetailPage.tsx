import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Package, MessageSquare, Star, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const tipOptions = [
  { value: 2000, label: "$2.000" },
  { value: 5000, label: "$5.000" },
  { value: 10000, label: "$10.000" },
];

const statusConfig = {
  pending: {
    label: "En espera de respuesta",
    description: "Un reciclador revisará tu solicitud pronto.",
    className: "bg-eco-yellow-light text-foreground",
    color: "text-eco-yellow",
  },
  accepted: {
    label: "Aceptada",
    description: "Un reciclador recogerá tu plástico en la franja seleccionada.",
    className: "bg-eco-green-light text-primary",
    color: "text-primary",
  },
  collected: {
    label: "Recolectada",
    description: "¡Gracias por reciclar! Tu impacto hace la diferencia.",
    className: "bg-muted text-muted-foreground",
    color: "text-muted-foreground",
  },
};

// Mock data - would come from API
const mockCollections: Record<string, {
  id: string;
  date: string;
  timeSlot: string;
  material: string;
  quantity: string;
  address: string;
  status: "pending" | "accepted" | "collected";
  comment: string;
}> = {
  "1": {
    id: "1",
    date: "Domingo 7 diciembre",
    timeSlot: "14:00 - 17:00",
    material: "PET",
    quantity: "3 kg",
    address: "Cra 15 #82-45, Chapinero, Bogotá",
    status: "accepted",
    comment: "",
  },
  "2": {
    id: "2",
    date: "Jueves 27 noviembre",
    timeSlot: "11:00 - 14:00",
    material: "PP",
    quantity: "2 kg",
    address: "Cra 15 #82-45, Chapinero, Bogotá",
    status: "collected",
    comment: "",
  },
  "3": {
    id: "3",
    date: "Lunes 3 noviembre",
    timeSlot: "8:00 - 11:00",
    material: "HDPE",
    quantity: "4 kg",
    address: "Cra 15 #82-45, Chapinero, Bogotá",
    status: "collected",
    comment: "",
  },
};

export default function CollectionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const collection = mockCollections[id || "1"] || mockCollections["1"];
  const status = statusConfig[collection.status];
  
  const [comment, setComment] = useState(collection.comment);
  const [isSaving, setIsSaving] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);
  const [hasTipped, setHasTipped] = useState(false);

  const handleSaveComment = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    toast.success("Comentario guardado");
  };

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error("Por favor selecciona una calificación");
      return;
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    setHasRated(true);
    toast.success("¡Gracias por tu calificación!");
  };

  const handleSendTip = async () => {
    if (!selectedTip) {
      toast.error("Por favor selecciona un monto");
      return;
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsSaving(false);
    setHasTipped(true);
    toast.success("¡Propina enviada al reciclador!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4 flex items-center gap-4 z-50 relative">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors relative z-10"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
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
              {collection.date} · {collection.timeSlot}
            </DetailRow>
            <DetailRow icon={Package} label="Material">
              <span className="eco-badge eco-badge-green mr-2">{collection.material}</span>
              {collection.quantity}
            </DetailRow>
            <DetailRow icon={MapPin} label="Dirección">
              {collection.address}
            </DetailRow>
          </div>
        </section>

        {/* Comment Section - Only for pending/accepted */}
        {collection.status !== "collected" && (
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
            <Button 
              onClick={handleSaveComment} 
              disabled={isSaving}
              className="w-full eco-button-primary"
            >
              {isSaving ? "Guardando..." : "Guardar comentario"}
            </Button>
          </section>
        )}

        {/* Rating & Tip Section - Only for collected */}
        {collection.status === "collected" && (
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
                    {[1, 2, 3].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-8 h-8",
                          star <= rating ? "fill-eco-yellow text-eco-yellow" : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm">¡Gracias por tu calificación!</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-center gap-3">
                    {[1, 2, 3].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-2 transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={cn(
                            "w-10 h-10 transition-colors",
                            star <= rating ? "fill-eco-yellow text-eco-yellow" : "text-muted-foreground hover:text-eco-yellow/50"
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
                  <p className="text-muted-foreground text-sm">¡Propina enviada! Gracias por tu generosidad.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {tipOptions.map((tip) => (
                      <button
                        key={tip.value}
                        onClick={() => setSelectedTip(tip.value)}
                        className={cn(
                          "py-3 px-4 rounded-xl border-2 font-semibold transition-all",
                          selectedTip === tip.value
                            ? "border-primary bg-eco-green-light text-primary"
                            : "border-border bg-background text-foreground hover:border-primary/50"
                        )}
                      >
                        {tip.label}
                      </button>
                    ))}
                  </div>
                  <Button 
                    onClick={handleSendTip} 
                    disabled={isSaving || !selectedTip}
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
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <div className="text-foreground">{children}</div>
      </div>
    </div>
  );
}
