import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, X, HelpCircle, Droplets, Wind, Package, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ScanStep = "permission" | "camera" | "result";

const materials = [
  { id: "pet", label: "PET", color: "bg-eco-green-light text-primary", isBottle: true },
  { id: "pp", label: "PP", color: "bg-eco-green-light text-primary", isBottle: false },
  { id: "ps", label: "PS", color: "bg-eco-green-light text-primary", isBottle: false },
  { id: "ecoladrillo", label: "Ecoladrillo", color: "bg-eco-green-light text-primary", isBottle: false },
  { id: "glass", label: "Vidrio", color: "bg-eco-coral-light text-accent", alert: true, isBottle: true },
];

const baseInstructions = [
  { icon: Droplets, text: "Lávalo con agua" },
  { icon: Wind, text: "Déjalo secar" },
  { icon: Package, text: "Aplástalo y guárdalo en una bolsa transparente" },
];

const bottleInstructions = [
  { icon: Droplets, text: "Lávalo con agua" },
  { icon: Wind, text: "Déjalo secar" },
  { icon: Package, text: "Retira la tapa y ponla por separado (también es reciclable)" },
  { icon: Package, text: "Quita la etiqueta si es posible" },
  { icon: Package, text: "Aplástalo y guárdalo en una bolsa transparente" },
];

export default function ScanPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<ScanStep>("permission");
  const [detectedMaterial] = useState(materials[0]); // Simulated detection
  const [estimatedWeight] = useState("2.5 kg"); // AI estimates weight automatically
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  const instructions = detectedMaterial.isBottle ? bottleInstructions : baseInstructions;
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("No se pudo acceder a la cámara. Verifica los permisos.");
      navigate(-1);
    }
  }, [navigate]);

  useEffect(() => {
    if (step === "camera") {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [step, startCamera, stopCamera]);

  const handlePermission = async () => {
    try {
      // Request permission first
      const permission = await navigator.mediaDevices.getUserMedia({ video: true });
      permission.getTracks().forEach(track => track.stop());
      setStep("camera");
    } catch (error) {
      console.error("Camera permission denied:", error);
      toast.error("Permiso de cámara denegado. Actívalo en la configuración del navegador.");
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(imageData);
        stopCamera();
        setStep("result");
      }
    }
  };

  const handleClose = () => {
    stopCamera();
    navigate(-1);
  };

  const handleSchedule = () => {
    navigate("/schedule", {
      state: { material: detectedMaterial.label, quantity: estimatedWeight },
    });
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
        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Real camera view */}
        <div className="flex-1 relative overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <div className="text-center mb-8">
              <p className="text-primary-foreground/90 text-lg font-medium drop-shadow-lg">
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
              <HelpCircle className="w-6 h-6 drop-shadow-lg" />
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-6 left-6 p-2 bg-foreground/40 backdrop-blur-sm rounded-full hover:bg-foreground/60 transition-colors"
          >
            <X className="w-6 h-6 text-primary-foreground" />
          </button>
        </div>

        {/* Capture button */}
        <div className="bg-foreground/90 backdrop-blur-sm py-8 flex flex-col items-center gap-4 safe-area-pb">
          <button
            onClick={handleCapture}
            className="w-20 h-20 rounded-full bg-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-elevated"
          >
            <div className="w-16 h-16 rounded-full border-4 border-primary" />
          </button>
          <button
            onClick={handleClose}
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
          onClick={handleClose}
          className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors"
        >
          <X className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-display font-semibold text-foreground">Resultado del escaneo</h1>
      </header>

      <div className="px-5 py-6 space-y-6">
        {/* Captured image preview */}
        {capturedImage && (
          <div className="animate-scale-in">
            <div className="eco-card p-2 overflow-hidden">
              <img 
                src={capturedImage} 
                alt="Foto capturada" 
                className="w-full h-48 object-cover rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Material detected */}
        <div className="text-center animate-scale-in" style={{ animationDelay: capturedImage ? "100ms" : "0ms" }}>
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
        <section className="eco-section animate-fade-up" style={{ animationDelay: capturedImage ? "200ms" : "100ms" }}>
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

        {/* Estimated weight (AI detected) */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: capturedImage ? "250ms" : "150ms" }}>
          <h2 className="eco-section-title">Peso estimado por IA</h2>
          <div className="eco-card flex items-center justify-between">
            <div>
              <p className="text-2xl font-display font-bold text-primary">{estimatedWeight}</p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="inline-flex items-center gap-1 bg-muted/50 px-2 py-0.5 rounded-full">
                  Aproximado
                </span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-eco-green-light flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
          </div>
        </section>

        {/* Schedule button */}
        <div className="pt-4 animate-fade-up" style={{ animationDelay: capturedImage ? "300ms" : "200ms" }}>
          <button
            onClick={handleSchedule}
            className="eco-button-primary w-full flex items-center justify-center gap-2"
          >
            Agendar recolección
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
