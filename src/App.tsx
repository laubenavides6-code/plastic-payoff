import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import HomePage from "./pages/HomePage";
import ScanPage from "./pages/ScanPage";
import SchedulePage from "./pages/SchedulePage";
import CollectionsPage from "./pages/CollectionsPage";
import CollectionDetailPage from "./pages/CollectionDetailPage";
import RewardsPage from "./pages/RewardsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import CampaignsPage from "./pages/CampaignsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: ("ciudadano" | "acopio")[] }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    if (user.role === "acopio") {
      return <Navigate to="/campaigns" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    if (user?.role === "acopio") {
      return <Navigate to="/campaigns" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute allowedRoles={["ciudadano"]}><HomePage /></ProtectedRoute>} />
      <Route path="/scan" element={<ProtectedRoute allowedRoles={["ciudadano"]}><ScanPage /></ProtectedRoute>} />
      <Route path="/schedule" element={<ProtectedRoute allowedRoles={["ciudadano"]}><SchedulePage /></ProtectedRoute>} />
      <Route path="/collections" element={<ProtectedRoute allowedRoles={["ciudadano"]}><CollectionsPage /></ProtectedRoute>} />
      <Route path="/collections/:id" element={<ProtectedRoute allowedRoles={["ciudadano"]}><CollectionDetailPage /></ProtectedRoute>} />
      <Route path="/rewards" element={<ProtectedRoute allowedRoles={["ciudadano"]}><RewardsPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={["ciudadano"]}><ProfilePage /></ProtectedRoute>} />
      <Route path="/campaigns" element={<ProtectedRoute allowedRoles={["acopio"]}><CampaignsPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AppWithAuth() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppWithAuth />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
