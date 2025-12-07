import { MobileLayout } from "@/components/layout/MobileLayout";
import { User, Mail, Phone, MapPin, Bell, Calendar, MessageCircle, FileText, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const mockUser = {
  name: "Laura García",
  email: "laura.garcia@email.com",
  phone: "+57 300 123 4567",
  address: "Cra 15 #82-45, Chapinero, Bogotá",
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(false);
  const [weeklyReminder, setWeeklyReminder] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast.success("Sesión cerrada");
  };

  return (
    <MobileLayout>
      <div className="px-5 py-6 space-y-6">
        {/* Header */}
        <header className="text-center animate-fade-up">
          <div className="w-20 h-20 rounded-full bg-eco-green-light flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground">{mockUser.name}</h1>
          <p className="text-muted-foreground text-sm">Miembro desde 2024</p>
        </header>

        {/* User info */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "50ms" }}>
          <h2 className="eco-section-title">Datos personales</h2>
          <div className="eco-card space-y-4">
            <InfoRow icon={Mail} label="Correo" value={mockUser.email} />
            <InfoRow icon={Phone} label="Teléfono" value={mockUser.phone} />
            <InfoRow icon={MapPin} label="Dirección" value={mockUser.address} />
          </div>
        </section>

        {/* Preferences */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "100ms" }}>
          <h2 className="eco-section-title">Preferencias</h2>
          <div className="eco-card space-y-4">
            <ToggleRow
              icon={Bell}
              label="Notificaciones push"
              description="Recibe alertas sobre tus recolecciones"
              checked={notifications}
              onChange={setNotifications}
            />
            <ToggleRow
              icon={Calendar}
              label="Recordatorio semanal"
              description="Te recordamos reciclar cada semana"
              checked={weeklyReminder}
              onChange={setWeeklyReminder}
            />
          </div>
        </section>

        {/* Support */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "150ms" }}>
          <h2 className="eco-section-title">Soporte</h2>
          <div className="eco-card space-y-1 p-0 overflow-hidden">
            <LinkRow icon={MessageCircle} label="Preguntas frecuentes" />
          </div>
        </section>

        {/* Legal */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "200ms" }}>
          <h2 className="eco-section-title">Legal</h2>
          <div className="eco-card space-y-1 p-0 overflow-hidden">
            <LinkRow icon={FileText} label="Política de datos" />
            <div className="px-4 py-3 flex items-center justify-between border-t border-border">
              <span className="text-sm text-muted-foreground">Versión</span>
              <span className="text-sm text-muted-foreground">1.0.0</span>
            </div>
          </div>
        </section>

        {/* Logout */}
        <section className="eco-section animate-fade-up" style={{ animationDelay: "250ms" }}>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full flex items-center justify-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </Button>
        </section>
      </div>
    </MobileLayout>
  );
}

interface InfoRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

function InfoRow({ icon: Icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

interface ToggleRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleRow({ icon: Icon, label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-5 h-5 text-muted-foreground mt-0.5" />
      <div className="flex-1">
        <p className="text-foreground font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-11 h-6 rounded-full transition-colors duration-200",
          checked ? "bg-primary" : "bg-muted"
        )}
      >
        <span
          className={cn(
            "absolute top-1 w-4 h-4 rounded-full bg-card shadow-sm transition-transform duration-200",
            checked ? "left-6" : "left-1"
          )}
        />
      </button>
    </div>
  );
}

interface LinkRowProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  external?: boolean;
}

function LinkRow({ icon: Icon, label, external }: LinkRowProps) {
  return (
    <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-t border-border first:border-t-0">
      <Icon className="w-5 h-5 text-muted-foreground" />
      <span className="flex-1 text-left text-foreground">{label}</span>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );
}
