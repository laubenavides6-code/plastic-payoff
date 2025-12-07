import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Package, MessageSquare, Star, DollarSign, Trash2, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

const tipOptions = [
  { value: 2000, label: "$2.000" },
  { value: 5000, label: "$5.000" },
  { value: 10000, label: "$10.000" },
  { value: "custom", label: "Otro" },
];

// Helper functions for localStorage persistence
const STORAGE_KEY = "collection_ratings";
const COLLECTIONS_KEY = "user_collections";

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

interface Collection {
  id: string;
  date: string;
  timeSlot: string;
  material: string;
  quantity: string;
  address: string;
  status: "pending" | "accepted" | "collected";
  comment?: string;
  createdAt?: string;
}

const getUserCollections = (): Collection[] => {
  try {
    const stored = localStorage.getItem(COLLECTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveUserCollections = (collections: Collection[]) => {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
};

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

// Mock data for static collections
const mockCollections: Record<string, Collection> = {
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

const timeSlots = [
  { id: "morning", label: "8:00 - 11:00" },
  { id: "midday", label: "11:00 - 14:00" },
  { id: "afternoon", label: "14:00 - 17:00" },
];

export default function CollectionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [collection, setCollection] = useState<Collection | null>(null);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [rating, setRating] = useState(0);
  const [selectedTip, setSelectedTip] = useState<number | string | null>(null);
  const [customTip, setCustomTip] = useState("");
  const [hasRated, setHasRated] = useState(false);
  const [hasTipped, setHasTipped] = useState(false);
  const [savedTipAmount, setSavedTipAmount] = useState<number | null>(null);
  const [canModify, setCanModify] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState("");

  // Load collection data
  useEffect(() => {
    if (!id) return;

    // First check user collections
    const userCollections = getUserCollections();
    const userCollection = userCollections.find(c => c.id === id);

    if (userCollection) {
      setCollection(userCollection);
      setComment(userCollection.comment || "");
      
      // Check if can modify (within 10 minutes of creation)
      if (userCollection.createdAt && userCollection.status === "pending") {
        const createdAt = new Date(userCollection.createdAt);
        const now = new Date();
        const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
        setCanModify(diffMinutes <= 10);
      }
    } else if (mockCollections[id]) {
      setCollection(mockCollections[id]);
      setComment(mockCollections[id].comment || "");
    }
  }, [id]);

  // Load saved rating data
  useEffect(() => {
    if (!collection) return;
    
    const savedData = getSavedRatings()[collection.id];
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
  }, [collection]);

  if (!collection) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  const status = statusConfig[collection.status];

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
    saveRating(collection.id, { rating });
    setIsSaving(false);
    setHasRated(true);
    toast.success("¡Gracias por tu calificación!");
  };

  const handleSendTip = async () => {
    const tipAmount = selectedTip === "custom" ? parseInt(customTip) : selectedTip as number;
    if (!tipAmount || tipAmount <= 0) {
      toast.error("Por favor ingresa un monto válido");
      return;
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    saveRating(collection.id, { tip: tipAmount });
    setIsSaving(false);
    setHasTipped(true);
    setSavedTipAmount(tipAmount);
    toast.success("¡Propina enviada al reciclador!");
  };

  const handleCancelCollection = async () => {
    if (!window.confirm("¿Estás seguro de que quieres cancelar esta recolección?")) {
      return;
    }

    const userCollections = getUserCollections();
    const filtered = userCollections.filter(c => c.id !== collection.id);
    saveUserCollections(filtered);
    
    toast.success("Recolección cancelada");
    navigate("/collections");
  };

  const handleUpdateTimeSlot = async () => {
    if (!newTimeSlot) {
      toast.error("Por favor selecciona un horario");
      return;
    }

    const userCollections = getUserCollections();
    const updatedCollections = userCollections.map(c => {
      if (c.id === collection.id) {
        const slotLabel = timeSlots.find(t => t.id === newTimeSlot)?.label || c.timeSlot;
        return { ...c, timeSlot: slotLabel };
      }
      return c;
    });

    saveUserCollections(updatedCollections);
    setCollection({ ...collection, timeSlot: timeSlots.find(t => t.id === newTimeSlot)?.label || collection.timeSlot });
    setShowEditModal(false);
    toast.success("Horario actualizado");
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

        {/* Actions for pending user collections */}
        {collection.status === "pending" && collection.id.startsWith("user-") && (
          <section className="eco-card space-y-3 animate-fade-up" style={{ animationDelay: "75ms" }}>
            <h2 className="font-display font-semibold text-foreground">Acciones</h2>
            
            {canModify && (
              <Button
                onClick={() => setShowEditModal(true)}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 bg-card hover:bg-eco-green-light hover:text-primary hover:border-primary/50"
              >
                <Edit3 className="w-4 h-4" />
                Modificar horario
              </Button>
            )}

            {!canModify && (
              <p className="text-xs text-muted-foreground text-center">
                El tiempo para modificar el horario ha expirado (máximo 10 minutos después de crear la solicitud).
              </p>
            )}

            <Button
              onClick={handleCancelCollection}
              variant="destructive"
              className="w-full flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Cancelar recolección
            </Button>
          </section>
        )}

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
                  <p className="text-foreground font-semibold mb-1">
                    ${savedTipAmount?.toLocaleString('es-CO')}
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

      {/* Edit Time Slot Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Modificar horario</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Selecciona un nuevo horario para tu recolección:
            </p>

            <div className="space-y-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setNewTimeSlot(slot.id)}
                  className={cn(
                    "w-full py-3 px-4 rounded-xl border-2 font-medium transition-all text-left",
                    newTimeSlot === slot.id
                      ? "border-primary bg-eco-green-light text-primary"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  )}
                >
                  {slot.label}
                </button>
              ))}
            </div>

            <Button
              onClick={handleUpdateTimeSlot}
              className="w-full eco-button-primary"
              disabled={!newTimeSlot}
            >
              Guardar cambios
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
