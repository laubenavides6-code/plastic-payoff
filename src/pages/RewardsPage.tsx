import { MobileLayout } from "@/components/layout/MobileLayout";
import { Leaf, Gift, Award, Sparkles, Recycle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const mockData = {
  points: 120,
  rewards: [
    { id: 1, title: "5% descuento en Juan Valdez", points: 50, image: "☕", available: true },
    { id: 2, title: "10% descuento en productos Éxito", points: 100, image: "🏷️", available: true },
    { id: 3, title: "Kit eco-aseo", points: 200, image: "🪥", available: false, subtitle: "Jabón artesanal y cepillo de bambú." },
    { id: 4, title: "Boletas de cine", points: 500, image: "🎬", available: false, subtitle: "2 entradas para ti" },
  ],
  medals: [
    { id: 1, title: "Primera Huella", subtitle: "Tu primer reciclaje", icon: Leaf, unlocked: true },
    { id: 2, title: "Guardián Verde", subtitle: "5 recolecciones", icon: Award, unlocked: true },
    { id: 3, title: "Reciclador Experto", subtitle: "10 kg reciclados", icon: Recycle, unlocked: false },
    { id: 4, title: "Eco-Héroe", subtitle: "50 recolecciones", icon: Sparkles, unlocked: false },
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
            {mockData.rewards.map((reward) => {
              const pointsNeeded = reward.points - mockData.points;
              const progress = Math.min((mockData.points / reward.points) * 100, 100);
              
              return (
                <div
                  key={reward.id}
                  className={cn(
                    "eco-card text-center relative overflow-hidden",
                    !reward.available && "opacity-80"
                  )}
                >
                  <div className="text-4xl mb-2">{reward.image}</div>
                  <h3 className="font-medium text-foreground text-sm">{reward.title}</h3>
                  <p className={cn(
                    "text-[10px] text-muted-foreground mt-0.5",
                    !reward.subtitle && "invisible"
                  )}>
                    {reward.subtitle || "Placeholder"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{reward.points} puntos</p>
                  {!reward.available && (
                    <div className="mt-2">
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-primary font-medium mt-1 block">
                        ¡Te faltan {pointsNeeded} puntos!
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
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
                    "w-12 h-12 min-w-[48px] min-h-[48px] rounded-xl flex items-center justify-center",
                    medal.unlocked ? "bg-eco-green-light" : "bg-muted"
                  )}
                >
                  {medal.unlocked ? (
                    <medal.icon className="w-6 h-6 text-primary" />
                  ) : (
                    <Lock className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm truncate">{medal.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">
                    {medal.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Impact */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "150ms" }}>
          <h2 className="eco-section-title">Tu impacto real</h2>
          <div className="space-y-3">
            <ImpactCard
              emoji="🌳"
              value="3 árboles"
              label="Has salvado el equivalente a 3 árboles con tu reciclaje"
              highlight="¡Sigue así!"
            />
            <ImpactCard
              emoji="👕"
              value="15 camisetas"
              label="Con 300 botellas recicladas se pueden fabricar 15 camisetas"
              highlight="Increíble aporte"
            />
            <ImpactCard
              emoji="🚗"
              value="50 km"
              label="Evitaste emisiones equivalentes a un viaje de 50 km en auto"
              highlight="Aire más limpio"
            />
          </div>
        </section>
      </div>
    </MobileLayout>
  );
}

interface ImpactCardProps {
  emoji: string;
  value: string;
  label: string;
  highlight: string;
}

function ImpactCard({ emoji, value, label, highlight }: ImpactCardProps) {
  return (
    <div className="eco-card flex items-start gap-4">
      <div className="w-12 h-12 min-w-[48px] rounded-xl bg-eco-green-light flex items-center justify-center text-2xl">
        {emoji}
      </div>
      <div className="flex-1">
        <p className="font-display font-bold text-foreground text-lg">{value}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{label}</p>
        <span className="inline-block mt-1 text-[10px] font-medium text-primary bg-eco-green-light px-2 py-0.5 rounded-full">
          {highlight}
        </span>
      </div>
    </div>
  );
}
