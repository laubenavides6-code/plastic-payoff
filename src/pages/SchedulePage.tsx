import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Clock, MessageSquare, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const dates = [
  { id: "today", label: "Hoy" },
  { id: "tomorrow", label: "Mañana" },
];

const timeSlots = [
  { id: "8-11", label: "8:00 - 11:00" },
  { id: "11-14", label: "11:00 - 14:00" },
  { id: "14-17", label: "14:00 - 17:00" },
  { id: "17-20", label: "17:00 - 20:00" },
];

export default function SchedulePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { material, quantity } = location.state || { material: "PET", quantity: "3 kg" };

  const [address, setAddress] = useState("Cra 15 #82-45, Chapinero, Bogotá");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = address && selectedDate && selectedTime;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);

    toast({
      title: "¡Solicitud enviada! 🎉",
      description: "EcoGiro notificará a un reciclador. Te avisaremos cuando acepte.",
    });

    navigate("/collections");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4 flex items-center gap-4 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-display font-semibold text-foreground">Agendar recolección</h1>
      </header>

      <div className="px-5 py-6 space-y-6">
        {/* Material summary */}
        <div className="eco-card bg-eco-green-light border border-primary/10 animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="eco-badge eco-badge-green">{material}</div>
            <span className="text-foreground font-medium">{quantity}</span>
          </div>
        </div>

        {/* Address */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "50ms" }}>
          <h2 className="eco-section-title flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Dirección *
          </h2>
          <div className="relative">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ingresa tu dirección completa"
              className="eco-input pr-20"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-primary font-medium hover:underline">
              Cambiar
            </button>
          </div>
        </section>

        {/* Date */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "100ms" }}>
          <h2 className="eco-section-title flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Fecha *
          </h2>
          <div className="flex gap-3">
            {dates.map((date) => (
              <button
                key={date.id}
                onClick={() => setSelectedDate(date.id)}
                className={cn(
                  "eco-chip flex-1 py-3",
                  selectedDate === date.id ? "eco-chip-active" : "eco-chip-inactive"
                )}
              >
                {date.label}
              </button>
            ))}
          </div>
        </section>

        {/* Time slots */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "150ms" }}>
          <h2 className="eco-section-title flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Franja horaria *
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setSelectedTime(slot.id)}
                className={cn(
                  "eco-chip py-3",
                  selectedTime === slot.id ? "eco-chip-active" : "eco-chip-inactive"
                )}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </section>

        {/* Comment */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "200ms" }}>
          <h2 className="eco-section-title flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Comentario (opcional)
          </h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ej: Tocar el timbre del apto 301"
            rows={3}
            className="eco-input resize-none"
          />
        </section>

        {/* Submit */}
        <div className="pt-4 space-y-3 animate-fade-up" style={{ animationDelay: "250ms" }}>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={cn(
              "eco-button-primary w-full flex items-center justify-center gap-2",
              (!canSubmit || isSubmitting) && "opacity-50 cursor-not-allowed shadow-none"
            )}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-5 h-5" />
                Confirmar solicitud
              </>
            )}
          </button>
          <p className="text-xs text-center text-muted-foreground">
            EcoGiro notificará a un reciclador. Te avisaremos cuando acepte.
          </p>
        </div>
      </div>
    </div>
  );
}
