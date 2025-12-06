import { MobileLayout } from "@/components/layout/MobileLayout";
import { ScanButton } from "@/components/home/ScanButton";
import { EcoPointsCard } from "@/components/home/EcoPointsCard";
import { UpcomingCollectionCard } from "@/components/home/UpcomingCollectionCard";

// Mock data
const mockUser = {
  name: "Laura",
  points: 120,
};

const mockCollection = {
  id: "1",
  date: "Hoy",
  timeSlot: "14:00 - 17:00",
  material: "PET",
  quantity: "3 kg",
  address: "Cra 15 #82-45, Chapinero",
  status: "accepted" as const,
};

export default function HomePage() {
  return (
    <MobileLayout>
      <div className="px-5 py-6 space-y-6">
        {/* Header */}
        <header className="animate-fade-up" style={{ animationDelay: "0ms" }}>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Hola, {mockUser.name} 🌿
          </h1>
          <p className="text-muted-foreground mt-1">
            Cada plástico cuenta. ¡Empieza hoy!
          </p>
        </header>

        {/* Scan Button */}
        <div className="animate-fade-up" style={{ animationDelay: "50ms" }}>
          <ScanButton />
        </div>

        {/* Eco Points */}
        <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <EcoPointsCard points={mockUser.points} />
        </div>

        {/* Upcoming Collection */}
        <div className="animate-fade-up" style={{ animationDelay: "150ms" }}>
          <UpcomingCollectionCard collection={mockCollection} />
        </div>

        {/* Quick Tips */}
        <section className="animate-fade-up space-y-3" style={{ animationDelay: "200ms" }}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Tips rápidos
          </h2>
          <div className="eco-card bg-eco-green-light border border-primary/10">
            <p className="text-sm text-foreground leading-relaxed">
              💡 <span className="font-medium">¿Sabías que?</span> Lavar y aplastar tus envases
              ayuda a que ocupen menos espacio y facilita su reciclaje.
            </p>
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}
