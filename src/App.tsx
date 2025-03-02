
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AuthGuard from "@/components/AuthGuard";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } />
            <Route path="/inbox" element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } />
            <Route path="/calendar" element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } />
            <Route path="/messages" element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } />
            <Route path="/documents" element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } />
            <Route path="/projects/:projectId" element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } />
            <Route path="/settings" element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
