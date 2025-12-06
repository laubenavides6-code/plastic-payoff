import { MobileLayout } from "@/components/layout/MobileLayout";
import { Leaf, Gift, Award, TreePine, Droplets, Wind, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const mockData = {
  points: 120,
  rewards: [
    { id: 1, title: "Café gratis", points: 50, image: "☕", available: true },
    { id: 2, title: "Descuento 10%", points: 100, image: "🏷️", available: true },
    { id: 3, title: "Bolsa ecológica", points: 200, image: "🛍️", available: false },
    { id: 4, title: "Árbol plantado", points: 500, image: "🌳", available: false },
  ],
  medals: [
    { id: 1, title: "Primera vez", icon: Leaf, unlocked: true },
    { id: 2, title: "5 recolecciones", icon: Award, unlocked: true },
    { id: 3, title: "10 kg reciclados", icon: TreePine, unlocked: false },
    { id: 4, title: "Eco-héroe", icon: Gift, unlocked: false },
  ],
  impact: {
    kgRecycled: 15,
    co2Saved: 12.5,
    plasticBottles: 300,
  },
};

export default function RewardsPage() {
  return (
    <MobileLayout>
      <div className="px-5 py-6 space-y-6">
        {/* Points header */}
        <header className="text-center animate-fade-up">
          <div className="w-20 h-20 rounded-3xl bg-eco-green-light flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-10 h-10 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm">Tus eco-puntos</p>
          <h1 className="text-5xl font-display font-bold text-foreground">{mockData.points}</h1>
        </header>

        {/* Rewards */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "50ms" }}>
          <h2 className="eco-section-title">Recompensas</h2>
          <div className="grid grid-cols-2 gap-3">
            {mockData.rewards.map((reward) => (
              <div
                key={reward.id}
                className={cn(
                  "eco-card text-center relative overflow-hidden",
                  !reward.available && "opacity-60"
                )}
              >
                <div className="text-4xl mb-2">{reward.image}</div>
                <h3 className="font-medium text-foreground text-sm">{reward.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{reward.points} puntos</p>
                {!reward.available && (
                  <span className="eco-badge eco-badge-coral absolute top-2 right-2 text-[10px]">
                    Próximamente
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Medals */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "100ms" }}>
          <h2 className="eco-section-title">Medallas</h2>
          <div className="grid grid-cols-2 gap-3">
            {mockData.medals.map((medal) => (
              <div
                key={medal.id}
                className={cn(
                  "eco-card flex items-center gap-3",
                  !medal.unlocked && "opacity-50"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    medal.unlocked ? "bg-eco-green-light" : "bg-muted"
                  )}
                >
                  {medal.unlocked ? (
                    <medal.icon className="w-6 h-6 text-primary" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-foreground text-sm">{medal.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {medal.unlocked ? "Desbloqueada" : "Bloqueada"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Impact */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "150ms" }}>
          <h2 className="eco-section-title">Tu impacto</h2>
          <div className="grid grid-cols-3 gap-3">
            <ImpactCard
              icon={TreePine}
              value={`${mockData.impact.kgRecycled} kg`}
              label="Reciclados"
            />
            <ImpactCard
              icon={Wind}
              value={`${mockData.impact.co2Saved} kg`}
              label="CO₂ evitado"
            />
            <ImpactCard
              icon={Droplets}
              value={mockData.impact.plasticBottles.toString()}
              label="Botellas"
            />
          </div>
        </section>
      </div>
    </MobileLayout>
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
