import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, X, HelpCircle, ArrowRight, ChevronDown, ChevronUp, Loader2, AlertTriangle, Leaf, Recycle, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type ScanStep = "permission" | "camera" | "processing" | "result";

interface ScanResponse {
  daño_ambiental: string[];
  preparacion: string[];
  impacto_inmediato: string[];
  materiales: string[];
}

// Mock response while endpoint is being developed
const MOCK_RESPONSE: ScanResponse = {
  daño_ambiental: [
    "Si la botas, tarda siglos.",
    "La tapa puede terminar en ríos.",
    "La etiqueta contamina si se mezcla."
  ],
  preparacion: [
    "Vacíala.",
    "Enjuaga rápido.",
    "Aplástala.",
    "Deja la tapa.",
    "La etiqueta no es obligatoria quitarla."
  ],
  impacto_inmediato: [
    "Evitas algo de CO2.",
    "Menos basura a Doña Juana.",
    "Aporta unos pesos al reciclador."
  ],
  materiales: [
    "Botella PET transparente.",
    "Tapa PP rígida.",
    "Etiqueta plástica."
  ],
};

const BASE_URL = "https://ecogiro.jdxico.easypanel.host";

export default function ScanPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<ScanStep>("permission");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    daño_ambiental: true,
    preparacion: false,
    impacto_inmediato: false,
    materiales: false,
  });
  
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
          facingMode: "environment",
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
      const permission = await navigator.mediaDevices.getUserMedia({ video: true });
      permission.getTracks().forEach(track => track.stop());
      setStep("camera");
    } catch (error) {
      console.error("Camera permission denied:", error);
      toast.error("Permiso de cámara denegado. Actívalo en la configuración del navegador.");
    }
  };

  const uploadImage = async (imageDataUrl: string): Promise<ScanResponse> => {
    // Convert base64 to blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("user_id", user?.user_id?.toString() || "1");
    formData.append("file", file);
    formData.append("campania_id", "");

    try {
      const apiResponse = await fetch(`${BASE_URL}/media/upload-image`, {
        method: "POST",
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.errors?.[0]?.message || "Error al procesar la imagen");
      }

      // For now, return mock response while endpoint is being developed
      // const data = await apiResponse.json();
      // return data;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return MOCK_RESPONSE;
    } catch (error) {
      // If fetch fails, still return mock response for now
      console.log("Using mock response while endpoint is unavailable");
      await new Promise(resolve => setTimeout(resolve, 1500));
      return MOCK_RESPONSE;
    }
  };

  const handleCapture = async () => {
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
        setStep("processing");

        try {
          const result = await uploadImage(imageData);
          setScanResult(result);
          setStep("result");
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Error al procesar la imagen";
          toast.error(errorMessage);
          setStep("camera");
          startCamera();
        }
      }
    }
  };

  const handleClose = () => {
    stopCamera();
    navigate(-1);
  };

  const handleSchedule = () => {
    navigate("/schedule", {
      state: { material: scanResult?.materiales?.[0] || "Material reciclable" },
    });
  };

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sectionConfig = [
    { key: "daño_ambiental", title: "Daño ambiental", icon: AlertTriangle, iconColor: "text-accent" },
    { key: "preparacion", title: "Preparación", icon: Package, iconColor: "text-primary" },
    { key: "impacto_inmediato", title: "Impacto inmediato", icon: Leaf, iconColor: "text-primary" },
    { key: "materiales", title: "Materiales detectados", icon: Recycle, iconColor: "text-primary" },
  ];

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
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="flex-1 relative overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <div className="text-center mb-8">
              <p className="text-primary-foreground/90 text-lg font-medium drop-shadow-lg">
                Enfoca el plástico que quieres reciclar
              </p>
            </div>

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

          <button
            onClick={handleClose}
            className="absolute top-6 left-6 p-2 bg-foreground/40 backdrop-blur-sm rounded-full hover:bg-foreground/60 transition-colors"
          >
            <X className="w-6 h-6 text-primary-foreground" />
          </button>
        </div>

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

  if (step === "processing") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-3xl bg-eco-green-light flex items-center justify-center mb-6 animate-pulse">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
        <h1 className="text-2xl font-display font-bold text-foreground mb-3">
          Analizando tu plástico
        </h1>
        <p className="text-muted-foreground">
          Estamos procesando la imagen...
        </p>
        {capturedImage && (
          <div className="mt-6 w-32 h-32 rounded-2xl overflow-hidden border-2 border-primary/20">
            <img 
              src={capturedImage} 
              alt="Procesando" 
              className="w-full h-full object-cover opacity-70"
            />
          </div>
        )}
      </div>
    );
  }

  // Result step
  return (
    <div className="min-h-screen bg-background">
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
        {/* Captured image preview - bigger */}
        {capturedImage && (
          <div className="animate-scale-in">
            <div className="eco-card p-2 overflow-hidden">
              <img 
                src={capturedImage} 
                alt="Foto capturada" 
                className="w-full h-64 object-cover rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Toggle sections */}
        {scanResult && (
          <div className="space-y-3 animate-fade-up" style={{ animationDelay: "100ms" }}>
            {sectionConfig.map(({ key, title, icon: Icon, iconColor }) => {
              const items = scanResult[key as keyof ScanResponse];
              if (!items || items.length === 0) return null;

              return (
                <Collapsible
                  key={key}
                  open={openSections[key]}
                  onOpenChange={() => toggleSection(key)}
                >
                  <div className="eco-card">
                    <CollapsibleTrigger className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-xl bg-muted flex items-center justify-center", iconColor)}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-foreground">{title}</span>
                      </div>
                      {openSections[key] ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4">
                      <ul className="space-y-2 pl-13">
                        {items.map((item, index) => (
                          <li 
                            key={index} 
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        )}

        {/* Schedule button */}
        <div className="pt-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
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