
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthContext";
import { Header } from "@/components/Header";
import Index from "./pages/Index";
import ChatPage from "./pages/ChatPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient();

// Conditional header component that doesn't show on the chat page
const ConditionalHeader = () => {
  const location = useLocation();
  if (location.pathname === '/chat') return null;
  return <Header />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <BrowserRouter>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={
              <>
                <Header />
                <div className="mt-16">
                  <Index />
                </div>
              </>
            } />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/auth" element={
              <>
                <Header />
                <div className="mt-16">
                  <AuthPage />
                </div>
              </>
            } />
            <Route path="/reset-password" element={
              <>
                <Header />
                <div className="mt-16">
                  <ResetPasswordPage />
                </div>
              </>
            } />
            <Route path="*" element={
              <>
                <Header />
                <div className="mt-16">
                  <NotFound />
                </div>
              </>
            } />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
