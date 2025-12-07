import { useState, useRef, useEffect, useCallback } from "react";
import { Camera, X, HelpCircle, ArrowRight, Loader2, Globe, Leaf, Recycle, Footprints, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";

type ScanStep = "permission" | "camera" | "processing" | "result";

interface ScanResponse {
  daño_ambiental: string[];
  preparacion: string[];
  impacto_inmediato: string[];
  materiales: string[];
  peso_estimado: string[];
  puntaje: number;
}

const BASE_URL = "https://ecogiro.jdxico.easypanel.host";

export default function ScanPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<ScanStep>("permission");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  
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
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" });

    const formData = new FormData();
    formData.append("user_id", user?.user_id?.toString() || "1");
    formData.append("file", file);
    formData.append("campania_id", "");

    const apiResponse = await fetch(`${BASE_URL}/media/upload-image`, {
      method: "POST",
      body: formData,
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json();
      throw new Error(errorData.detail || "Error al procesar la imagen");
    }

    const data = await apiResponse.json();
    const iaResult = JSON.parse(data.ia_result.response) as ScanResponse;
    return iaResult;
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
          console.error("Scan error:", error);
          toast.error("El scanner falló. Por favor, intenta de nuevo.");
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
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    // Extract average weight from peso_estimado array
    const pesoText = scanResult?.peso_estimado?.find(p => p.toLowerCase().includes("total")) || "";
    const pesoMatch = pesoText.match(/(\d+)\s*a\s*(\d+)/);
    const avgPeso = pesoMatch ? ((parseInt(pesoMatch[1]) + parseInt(pesoMatch[2])) / 2 / 1000).toFixed(3) : "0";
    
    // Get materials from the response for the schedule page
    const materialesText = scanResult?.materiales?.join(", ") || "Material reciclable";
    
    navigate("/schedule", {
      state: { 
        material: materialesText,
        peso: avgPeso,
        puntos_otorgados: scanResult?.puntaje?.toString() || "0",
        capturedImage: capturedImage,
      },
    });
  };

  // Check if materials are valid recyclable materials
  const hasValidMaterials = scanResult?.materiales && 
    scanResult.materiales.length > 0 && 
    !scanResult.materiales.some(m => 
      m.toLowerCase().includes("no hay materiales") || 
      m.toLowerCase().includes("no se detectó") ||
      m.toLowerCase().includes("no visible")
    ) &&
    (scanResult?.puntaje ?? 0) > 0;

  const sectionConfig = [
    { key: "materiales", title: "Materiales detectados", icon: Package, iconColor: "text-primary" },
    { key: "preparacion", title: "Cómo prepararlo", icon: Footprints, iconColor: "text-primary" },
    { key: "impacto_inmediato", title: "Tu impacto positivo", icon: Leaf, iconColor: "text-primary" },
    { key: "daño_ambiental", title: "¿Qué pasaría si no reciclas?", icon: Globe, iconColor: "text-primary" },
    { key: "peso_estimado", title: "Peso estimado", icon: Package, iconColor: "text-primary" },
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

            <p className="mt-4 text-muted-foreground/80 drop-shadow-lg" style={{ fontSize: "10px" }}>
              Asegurate que solo se vean los residuos que quieras escannear para mejores resultados
            </p>

            <button className="mt-4 p-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors">
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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center" style={{ minHeight: "100dvh" }}>
        <div className="flex flex-col items-center justify-center flex-1">
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


        {/* Result cards */}
        {scanResult && (
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: "100ms" }}>
            {sectionConfig.map(({ key, title, icon: Icon, iconColor }) => {
              const items = scanResult[key as keyof Omit<ScanResponse, 'puntaje'>];
              if (!items || !Array.isArray(items) || items.length === 0) return null;

              const isPreparacion = key === "preparacion";
              const isPesoEstimado = key === "peso_estimado";

              return (
                <Card key={key} className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn("w-10 h-10 rounded-xl bg-eco-green-light flex items-center justify-center", iconColor)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{title}</span>
                    </div>
                  </div>
                  
                  {isPesoEstimado ? (
                    // Show average weight in kg with special styling
                    (() => {
                      // Find the "total" line or use first item
                      const totalLine = items.find(p => p.toLowerCase().includes("total")) || items[0] || "";
                      const pesoMatch = totalLine.match(/(\d+)\s*a\s*(\d+)/);
                      let avgKg = pesoMatch 
                        ? ((parseInt(pesoMatch[1]) + parseInt(pesoMatch[2])) / 2 / 1000).toFixed(4)
                        : "0";
                      
                      // If weight is 0, show 0.001 instead
                      if (avgKg === "0" || avgKg === "0.0000") {
                        avgKg = "0,001";
                      }
                      
                      return (
                        <div className="flex flex-col gap-1">
                          <span className="text-2xl font-bold text-primary">{avgKg} kg</span>
                          <span className="text-muted-foreground/60 bg-muted/30 px-2 py-0.5 rounded-full w-fit" style={{ fontSize: "8px" }}>Aproximado</span>
                        </div>
                      );
                    })()
                  ) : isPreparacion ? (
                    <div className="space-y-2">
                      {items.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className="text-sm font-semibold text-primary flex-shrink-0 w-5">
                            {index + 1}.
                          </span>
                          <span className="text-sm text-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {items.slice(0, 3).map((item, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {/* Schedule button */}
        <div className="pt-4 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <button
            onClick={handleSchedule}
            disabled={!hasValidMaterials}
            className="eco-button-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Agendar recolección
            <ArrowRight className="w-5 h-5" />
          </button>
          {!hasValidMaterials && (
            <p className="text-center text-destructive mt-2" style={{ fontSize: "12px" }}>
              No se detectaron materiales reciclables válidos
            </p>
          )}
        </div>
      </div>
    </div>
  );
}