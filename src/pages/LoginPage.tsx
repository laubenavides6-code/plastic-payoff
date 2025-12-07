import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, User } from "lucide-react";
import { toast } from "sonner";
import logoSolo from "@/assets/logo-solo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identification, setIdentification] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!identification.trim() || !password.trim()) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    setIsLoading(true);
    const result = await login(identification.trim(), password);
    setIsLoading(false);

    if (result.success) {
      toast.success("¡Bienvenido!");
      // Redirect handled by App.tsx based on role
      navigate("/");
    } else {
      toast.error(result.error || "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8 animate-fade-up">
        {/* Logo */}
        <div className="text-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
            <img src={logoSolo} alt="EcoGiro Logo" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">EcoGiro</h1>
          <p className="text-primary text-sm font-medium mt-2 italic">Tu reciclaje, su oportunidad, nuestro futuro</p>
          <p className="text-muted-foreground mt-2">Ingresa a tu cuenta</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Número de identificación
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                value={identification}
                onChange={(e) => setIdentification(e.target.value)}
                placeholder="Ingresa tu identificación"
                className="eco-input pl-12"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="eco-input pl-12"
                disabled={isLoading}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full eco-button-primary mt-6"
            disabled={isLoading}
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
