import { useState } from "react";
import { Camera, X, HelpCircle, Droplets, Wind, Package, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

type ScanStep = "permission" | "camera" | "result";

const materials = [
  { id: "pet", label: "PET", color: "bg-eco-green-light text-primary" },
  { id: "pp", label: "PP", color: "bg-eco-green-light text-primary" },
  { id: "ps", label: "PS", color: "bg-eco-green-light text-primary" },
  { id: "ecoladrillo", label: "Ecoladrillo", color: "bg-eco-green-light text-primary" },
  { id: "glass", label: "Vidrio", color: "bg-eco-coral-light text-accent", alert: true },
];

const quantities = ["1 kg", "3 kg", "5 kg"];

const instructions = [
  { icon: Droplets, text: "Lávalo con agua" },
  { icon: Wind, text: "Déjalo secar" },
  { icon: Package, text: "Aplástalo y guárdalo en una bolsa transparente" },
];

export default function ScanPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ScanStep>("permission");
  const [detectedMaterial] = useState(materials[0]); // Simulated detection
  const [selectedQuantity, setSelectedQuantity] = useState<string | null>(null);

  const handlePermission = () => {
    setStep("camera");
  };

  const handleCapture = () => {
    // Simulate AI detection
    setTimeout(() => {
      setStep("result");
    }, 500);
  };

  const handleSchedule = () => {
    if (selectedQuantity) {
      navigate("/schedule", {
        state: { material: detectedMaterial.label, quantity: selectedQuantity },
      });
    }
  };

  if (step === "permission") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-3xl bg-eco-green-light flex items-center justify-center mb-6 animate-scale-in">
          <Camera className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-3 animate-fade-up">
          Escanea tu plástico
        </h1>
        <p className="text-muted-foreground mb-8 animate-fade-up" style={{ animationDelay: "50ms" }}>
          Necesitamos tu cámara para analizar tu plástico en segundos.
        </p>
        <button
          onClick={handlePermission}
          className="eco-button-primary w-full max-w-xs animate-fade-up"
          style={{ animationDelay: "100ms" }}
        >
          Permitir cámara
        </button>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors animate-fade-up"
          style={{ animationDelay: "150ms" }}
        >
          Cancelar
        </button>
      </div>
    );
  }

  if (step === "camera") {
    return (
      <div className="min-h-screen bg-foreground relative flex flex-col">
        {/* Simulated camera view */}
        <div className="flex-1 relative bg-gradient-to-b from-foreground/90 to-foreground flex items-center justify-center">
          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <div className="text-center mb-8">
              <p className="text-primary-foreground/90 text-lg font-medium">
                Enfoca el plástico que quieres reciclar
              </p>
            </div>

            {/* Viewfinder frame */}
            <div className="w-64 h-64 border-2 border-primary-foreground/50 rounded-3xl relative">
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-2xl" />
            </div>

            <button className="mt-8 p-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              <HelpCircle className="w-6 h-6" />
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 p-2 bg-primary-foreground/20 rounded-full hover:bg-primary-foreground/30 transition-colors"
          >
            <X className="w-6 h-6 text-primary-foreground" />
          </button>
        </div>

        {/* Capture button */}
        <div className="bg-foreground py-8 flex flex-col items-center gap-4 safe-area-pb">
          <button
            onClick={handleCapture}
            className="w-20 h-20 rounded-full bg-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-elevated"
          >
            <div className="w-16 h-16 rounded-full border-4 border-primary" />
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-primary-foreground/70 text-sm hover:text-primary-foreground transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  // Result step
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-5 py-4 flex items-center gap-4 z-10">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-display font-semibold text-foreground">Resultado del escaneo</h1>
      </header>

      <div className="px-5 py-6 space-y-6">
        {/* Material detected */}
        <div className="text-center animate-scale-in">
          <span
            className={cn(
              "inline-block text-4xl font-display font-bold px-6 py-3 rounded-2xl",
              detectedMaterial.color
            )}
          >
            {detectedMaterial.label}
          </span>
          {detectedMaterial.alert && (
            <div className="mt-4 eco-card bg-eco-coral-light border border-accent/20">
              <p className="text-sm text-foreground">
                ⚠️ Este material requiere manejo especial. Un reciclador te contactará para más detalles.
              </p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "100ms" }}>
          <h2 className="eco-section-title">Prepáralo así</h2>
          <div className="eco-card space-y-4">
            {instructions.map((instruction, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-eco-green-light flex items-center justify-center flex-shrink-0">
                  <instruction.icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-foreground">{instruction.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quantity selection */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "150ms" }}>
          <h2 className="eco-section-title">¿Cuánto tienes?</h2>
          <div className="flex gap-3">
            {quantities.map((qty) => (
              <button
                key={qty}
                onClick={() => setSelectedQuantity(qty)}
                className={cn(
                  "eco-chip flex-1 py-3",
                  selectedQuantity === qty ? "eco-chip-active" : "eco-chip-inactive"
                )}
              >
                {qty}
              </button>
            ))}
          </div>
        </section>

        {/* Schedule button */}
        <div className="pt-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <button
            onClick={handleSchedule}
            disabled={!selectedQuantity}
            className={cn(
              "eco-button-primary w-full flex items-center justify-center gap-2",
              !selectedQuantity && "opacity-50 cursor-not-allowed shadow-none"
            )}
          >
            Agendar recolección
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
