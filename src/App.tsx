
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
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelledPage from "./pages/PaymentCancelledPage";
import SettingsPage from "./pages/SettingsPage";
import { TooltipProvider } from "@/components/ui/tooltip";

// Configure the query client with options to prevent refetches on window focus
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent refetches when switching tabs
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Header wrapper component that conditionally renders the header
const HeaderWrapper = () => {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';
  
  if (isChatPage) return null;
  return <Header />;
};

// Wrap the entire app with React.StrictMode
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
                <Index />
              </>
            } />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/auth" element={
              <>
                <Header />
                <AuthPage />
              </>
            } />
            <Route path="/reset-password" element={
              <>
                <Header />
                <ResetPasswordPage />
              </>
            } />
            <Route path="/payment-success" element={
              <>
                <Header />
                <PaymentSuccessPage />
              </>
            } />
            <Route path="/payment-cancelled" element={
              <>
                <Header />
                <PaymentCancelledPage />
              </>
            } />
            <Route path="/settings" element={
              <>
                <Header />
                <SettingsPage />
              </>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={
              <>
                <Header />
                <NotFound />
              </>
            } />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
