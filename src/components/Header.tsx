
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuthContext } from "@/components/auth/AuthContext";
import { Settings } from "lucide-react";

export function Header() {
  const { user } = useAuthContext();
  const location = useLocation();

  // Check if the current path matches any of these routes
  const isAuthPage = location.pathname === "/auth";
  const isResetPasswordPage = location.pathname === "/reset-password";

  // Don't show auth button on auth pages
  const showAuthButton = !isAuthPage && !isResetPasswordPage;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link to="/" className="flex items-center space-x-2">
            <span className="inline-block font-bold">
              TIMELINE
            </span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link
              to="/"
              className="flex items-center text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Home
            </Link>
            {user && (
              <>
                <Link
                  to="/chat"
                  className="flex items-center text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Chat
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Settings
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <UserMenu />
          ) : showAuthButton ? (
            <Button asChild size="sm">
              <Link to="/auth">Login</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
