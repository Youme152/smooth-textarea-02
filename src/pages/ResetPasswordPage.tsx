
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import SquaresBackground from "@/components/SquaresBackground";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a hash in the URL (needed for password reset)
    const hash = window.location.hash;
    if (!hash) {
      toast({
        variant: "destructive",
        title: "Invalid reset link",
        description: "The password reset link is invalid or has expired."
      });
      navigate("/auth");
    }
  }, [navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully."
      });

      navigate("/auth");
    } catch (error: any) {
      console.error("Error resetting password:", error);
      setError(error.message || "Failed to reset password. Please try again.");
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reset password. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] p-4 relative">
      <SquaresBackground />
      
      <div className="w-full max-w-md z-10">
        <div className="rounded-xl border border-neutral-800 bg-black/80 p-6 shadow-xl backdrop-blur-sm">
          <div className="mb-6 text-center">
            <h1 className="font-playfair text-3xl font-bold text-white mb-1">
              Reset Your Password
            </h1>
            <p className="text-neutral-400">
              Enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                New Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
                required
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
                required
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 mt-2">{error}</div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Reset Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
