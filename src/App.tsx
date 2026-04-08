import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Login from "./pages/Login.tsx";
import Index from "./pages/Index.tsx";
import JourneySetup from "./pages/JourneySetup.tsx";
import JourneyLoading from "./pages/JourneyLoading.tsx";
import JourneyOptions from "./pages/JourneyOptions.tsx";
import JourneyConfirmed from "./pages/JourneyConfirmed.tsx";
import AdminMetrics from "./pages/AdminMetrics.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/journey/setup" element={<ProtectedRoute><JourneySetup /></ProtectedRoute>} />
            <Route path="/journey/loading" element={<ProtectedRoute><JourneyLoading /></ProtectedRoute>} />
            <Route path="/journey/options" element={<ProtectedRoute><JourneyOptions /></ProtectedRoute>} />
            <Route path="/journey/confirmed" element={<ProtectedRoute><JourneyConfirmed /></ProtectedRoute>} />
            <Route path="/admin/metrics" element={<ProtectedRoute><AdminMetrics /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
