import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, MapPin, Package, MessageSquare, Leaf, TreePine, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

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
const mockCollection = {
  id: "1",
  date: "Hoy, 6 de diciembre",
  timeSlot: "14:00 - 17:00",
  material: "PET",
  quantity: "3 kg",
  address: "Cra 15 #82-45, Chapinero, Bogotá",
  status: "collected" as const,
  comment: "Tocar el timbre del apto 301",
  pointsEarned: 15,
  impact: {
    kgConfirmed: 3,
    co2Saved: 2.4,
    bottlesSaved: 60,
  },
};

export default function CollectionDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const collection = mockCollection; // Would fetch by id
  const status = statusConfig[collection.status];

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
        <h1 className="text-lg font-display font-semibold text-foreground">Detalle de recolección</h1>
      </header>

      <div className="px-5 py-6 space-y-6">
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
            {collection.comment && (
              <DetailRow icon={MessageSquare} label="Comentario">
                {collection.comment}
              </DetailRow>
            )}
          </div>
        </section>

        {/* Points earned (only if collected) */}
        {collection.status === "collected" && (
          <section className="eco-card bg-eco-green-light border border-primary/10 text-center animate-fade-up" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Leaf className="w-6 h-6 text-primary" />
              <span className="text-3xl font-display font-bold text-primary">
                +{collection.pointsEarned}
              </span>
            </div>
            <p className="text-sm text-foreground">Eco-puntos ganados 🎉</p>
          </section>
        )}

        {/* Impact (only if collected) */}
        {collection.status === "collected" && (
          <section className="eco-section animate-fade-up" style={{ animationDelay: "150ms" }}>
            <h2 className="eco-section-title">Tu impacto</h2>
            <div className="grid grid-cols-3 gap-3">
              <ImpactCard
                icon={Package}
                value={`${collection.impact.kgConfirmed} kg`}
                label="Confirmados"
              />
              <ImpactCard
                icon={Wind}
                value={`${collection.impact.co2Saved} kg`}
                label="CO₂ evitado"
              />
              <ImpactCard
                icon={TreePine}
                value={collection.impact.bottlesSaved.toString()}
                label="Botellas"
              />
            </div>
          </section>
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

interface ImpactCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}

function ImpactCard({ icon: Icon, value, label }: ImpactCardProps) {
  return (
    <div className="eco-card text-center">
      <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
      <p className="font-display font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
