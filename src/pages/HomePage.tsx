import { MobileLayout } from "@/components/layout/MobileLayout";
import { ScanButton } from "@/components/home/ScanButton";
import { EcoPointsCard } from "@/components/home/EcoPointsCard";
import { UpcomingCollectionFromAPI } from "@/components/home/UpcomingCollectionFromAPI";
import { UpcomingCollectionSkeleton } from "@/components/home/UpcomingCollectionSkeleton";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { useAuth } from "@/contexts/AuthContext";
import { useReports } from "@/contexts/ReportsContext";
import { Recycle } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { isLoading, upcomingCollection } = useReports();

  return (
    <MobileLayout>
      <div className="px-5 py-6 space-y-6">
        {/* Header */}
        <header className="animate-fade-up flex items-start justify-between" style={{ animationDelay: "0ms" }}>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              Hola, {user?.nombres || "Usuario"} <Recycle className="w-6 h-6 text-primary" />
            </h1>
            <p className="text-muted-foreground mt-1">
              Cada plástico cuenta. ¡Empieza hoy!
            </p>
          </div>
          <NotificationCenter />
        </header>

        {/* Scan Button */}
        <div className="animate-fade-up" style={{ animationDelay: "50ms" }}>
          <ScanButton />
        </div>

        {/* Eco Points */}
        <div className="animate-fade-up" style={{ animationDelay: "100ms" }}>
          <EcoPointsCard points={user?.puntos_acumulados || 0} />
        </div>

        {/* Upcoming Collection */}
        <section className="animate-fade-up space-y-3" style={{ animationDelay: "150ms" }}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Próxima recolección
          </h2>
          {isLoading ? (
            <UpcomingCollectionSkeleton />
          ) : upcomingCollection ? (
            <UpcomingCollectionFromAPI report={upcomingCollection} />
          ) : (
            <div className="eco-card text-center py-6">
              <p className="text-muted-foreground">No tienes recolecciones programadas</p>
            </div>
          )}
        </section>

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
