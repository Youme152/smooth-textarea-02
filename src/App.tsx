
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
import { SidebarProvider } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useAuthContext } from "@/components/auth/AuthContext";

const queryClient = new QueryClient();

// Sidebar wrapper that only shows when user is authenticated
const SidebarWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthContext();
  const location = useLocation();
  
  // Only show sidebar on home page and chat page when authenticated
  const showSidebar = user && (location.pathname === "/" || location.pathname === "/chat" || location.pathname.startsWith("/chat"));
  
  if (!showSidebar) {
    return <>{children}</>;
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex flex-col h-screen w-full bg-[#131314] text-white overflow-hidden">
        <ChatSidebar />
        <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-[16rem]">
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

// Conditional header component that doesn't show on the chat page
const ConditionalHeader = () => {
  const location = useLocation();
  if (location.pathname === '/chat' || location.pathname.startsWith('/chat')) return null;
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
              <SidebarWrapper>
                <ConditionalHeader />
                <div className="mt-16">
                  <Index />
                </div>
              </SidebarWrapper>
            } />
            <Route path="/chat" element={
              <SidebarWrapper>
                <ChatPage />
              </SidebarWrapper>
            } />
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
