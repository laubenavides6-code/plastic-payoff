import { MobileLayout } from "@/components/layout/MobileLayout";
import { Clock, MapPin, Package, ChevronRight, Star, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const statusConfig = {
  pending: {
    label: "En espera",
    className: "bg-eco-yellow-light text-foreground",
  },
  accepted: {
    label: "Aceptada",
    className: "bg-eco-green-light text-primary",
  },
  collected: {
    label: "Recolectada",
    className: "bg-muted text-muted-foreground",
  },
};

const mockCollections = [
  {
    id: "1",
    date: "Domingo 7 diciembre",
    timeSlot: "14:00 - 17:00",
    material: "PET",
    quantity: "3 kg",
    address: "Cra 15 #82-45, Chapinero, Bogotá",
    status: "accepted" as const,
  },
  {
    id: "2",
    date: "Jueves 27 noviembre",
    timeSlot: "11:00 - 14:00",
    material: "PP",
    quantity: "2 kg",
    address: "Cra 15 #82-45, Chapinero, Bogotá",
    status: "collected" as const,
  },
  {
    id: "3",
    date: "Lunes 3 noviembre",
    timeSlot: "8:00 - 11:00",
    material: "HDPE",
    quantity: "4 kg",
    address: "Cra 15 #82-45, Chapinero, Bogotá",
    status: "collected" as const,
  },
];

export default function CollectionsPage() {
  const upcoming = mockCollections.filter((c) => c.status !== "collected");
  const history = mockCollections.filter((c) => c.status === "collected");

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
              {upcoming.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
              ))}
            </div>
          </section>
        )}

        {/* History */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "100ms" }}>
          <h2 className="eco-section-title">Historial</h2>
          {history.length > 0 ? (
            <div className="space-y-3">
              {history.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} />
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
  collection: {
    id: string;
    date: string;
    timeSlot: string;
    material: string;
    quantity: string;
    address: string;
    status: "pending" | "accepted" | "collected";
  };
}

function CollectionCard({ collection }: CollectionCardProps) {
  const status = statusConfig[collection.status];
  
  // Get saved rating and tip from localStorage
  const savedRating = (() => {
    const stored = localStorage.getItem(`rating_${collection.id}`);
    return stored ? parseInt(stored, 10) : 0;
  })();
  
  const savedTip = (() => {
    const stored = localStorage.getItem(`tip_${collection.id}`);
    return stored ? parseInt(stored, 10) : null;
  })();

  return (
    <Link
      to={`/collections/${collection.id}`}
      className="eco-card block group hover:shadow-elevated transition-shadow duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <span className={cn("eco-badge", status.className)}>{status.label}</span>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-foreground font-medium">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>{collection.date} · {collection.timeSlot}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Package className="w-4 h-4" />
          <span>{collection.material} · {collection.quantity}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{collection.address}</span>
        </div>
        
        {/* Show rating and tip if collected */}
        {collection.status === "collected" && (savedRating > 0 || savedTip !== null) && (
          <div className="flex items-center gap-4 pt-2 border-t border-border mt-2">
            {savedRating > 0 && (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-3.5 h-3.5",
                      star <= savedRating ? "fill-eco-yellow text-eco-yellow" : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            )}
            {savedTip !== null && (
              <div className="flex items-center gap-1 text-xs text-primary">
                <DollarSign className="w-3.5 h-3.5" />
                <span>${savedTip.toLocaleString("es-CO")}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
