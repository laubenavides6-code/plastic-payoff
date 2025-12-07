import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, MessageSquare, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { format, addDays } from "date-fns";
import { es } from "date-fns/locale";
import AddressInput from "@/components/schedule/AddressInput";

const timeSlots = [
  { id: "8-11", label: "8:00 - 11:00" },
  { id: "11-14", label: "11:00 - 14:00" },
  { id: "14-17", label: "14:00 - 17:00" },
  { id: "17-20", label: "17:00 - 20:00" },
];

export default function SchedulePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { material, quantity } = location.state || { material: "PET", quantity: "2.5 kg" };

  // Generate dates starting from tomorrow (minimum 24 hours)
  const availableDates = useMemo(() => {
    const tomorrow = addDays(new Date(), 1);
    const dayAfter = addDays(new Date(), 2);
    const twoDaysAfter = addDays(new Date(), 3);
    
    return [
      { id: "tomorrow", label: format(tomorrow, "EEEE d 'de' MMMM", { locale: es }) },
      { id: "dayAfter", label: format(dayAfter, "EEEE d 'de' MMMM", { locale: es }) },
      { id: "twoDaysAfter", label: format(twoDaysAfter, "EEEE d 'de' MMMM", { locale: es }) },
    ];
  }, []);

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

    // Get the selected date label
    const selectedDateObj = availableDates.find(d => d.id === selectedDate);
    const selectedTimeObj = timeSlots.find(t => t.id === selectedTime);

    // Create new collection
    const newCollection = {
      id: `user-${Date.now()}`,
      date: selectedDateObj?.label || "",
      timeSlot: selectedTimeObj?.label || "",
      material,
      quantity,
      address,
      status: "pending" as const,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage
    const COLLECTIONS_KEY = "user_collections";
    const existingCollections = JSON.parse(localStorage.getItem(COLLECTIONS_KEY) || "[]");
    existingCollections.unshift(newCollection);
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(existingCollections));

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
            <div className="flex items-center gap-2">
              <span className="text-foreground font-medium">{quantity}</span>
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">Aproximado</span>
            </div>
          </div>
        </div>

        {/* Address */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "50ms" }}>
          <h2 className="eco-section-title">Dirección de recolección *</h2>
          <AddressInput value={address} onChange={setAddress} />
        </section>

        {/* Date */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "100ms" }}>
          <h2 className="eco-section-title flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Fecha * <span className="text-xs text-muted-foreground font-normal">(mínimo 24 horas)</span>
          </h2>
          <div className="flex flex-col gap-2">
            {availableDates.map((date) => (
              <button
                key={date.id}
                onClick={() => setSelectedDate(date.id)}
                className={cn(
                  "eco-chip py-3 text-left",
                  selectedDate === date.id ? "eco-chip-active" : "eco-chip-inactive"
                )}
              >
                <span className="font-medium capitalize">{date.label}</span>
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
