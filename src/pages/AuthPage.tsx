
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthContext } from "@/components/auth/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import SquaresBackground from "@/components/SquaresBackground";
import { HighlightedText } from "@/components/ui/highlighted-text";
import { Loader2 } from "lucide-react";

enum AuthMode {
  SIGN_IN = "sign_in",
  SIGN_UP = "sign_up",
  FORGOT_PASSWORD = "forgot_password",
}

const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>(AuthMode.SIGN_IN);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { signIn, signUp, resetPassword, user } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  // If signup was successful and we're showing the success message,
  // automatically redirect to sign in mode after 3 seconds
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
        setMode(AuthMode.SIGN_IN);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === AuthMode.SIGN_IN) {
        await signIn(email, password);
        navigate("/");
      } else if (mode === AuthMode.SIGN_UP) {
        await signUp(email, password, fullName);
        // Switch to success state instead of staying on the page
        setIsSuccess(true);
        // Clear form for future use
        setEmail("");
        setPassword("");
        setFullName("");
      } else if (mode === AuthMode.FORGOT_PASSWORD) {
        await resetPassword(email);
        // Stay on the page but switch back to sign in
        setMode(AuthMode.SIGN_IN);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      // Error toasts are shown in the auth functions
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSuccessMessage = () => (
    <div className="text-center animate-in fade-in slide-in-from-bottom-5 duration-500">
      <h2 className="text-2xl font-bold text-white mb-4">Account Created Successfully!</h2>
      <p className="text-neutral-300 mb-6">
        {user 
          ? "You're now signed in! Redirecting..." 
          : "You can now sign in with your credentials."}
      </p>
      <Button
        onClick={() => setMode(AuthMode.SIGN_IN)} 
        className="bg-white text-black hover:bg-neutral-200"
      >
        Continue to Sign In
      </Button>
    </div>
  );

  const renderForm = () => (
    <div className="rounded-xl border border-neutral-800 bg-black/80 p-6 shadow-xl backdrop-blur-sm">
      <div className="mb-6 text-center">
        <h1 className="font-playfair text-3xl font-bold text-white mb-1">
          {mode === AuthMode.SIGN_IN ? "Welcome Back" : 
           mode === AuthMode.SIGN_UP ? "Create Your Account" : 
           "Reset Your Password"}
        </h1>
        <p className="text-neutral-400">
          {mode === AuthMode.SIGN_IN ? "Sign in to continue to Timeline" : 
           mode === AuthMode.SIGN_UP ? "Start creating viral content today" : 
           "We'll send you a link to reset your password"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === AuthMode.SIGN_UP && (
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-white">
              Full Name
            </Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
            required
          />
        </div>

        {mode !== AuthMode.FORGOT_PASSWORD && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              {mode === AuthMode.SIGN_IN && (
                <button
                  type="button"
                  onClick={() => setMode(AuthMode.FORGOT_PASSWORD)}
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete={mode === AuthMode.SIGN_IN ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500"
              required
            />
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            mode === AuthMode.SIGN_IN ? "Sign In" : 
            mode === AuthMode.SIGN_UP ? "Create Account" : 
            "Send Reset Link"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-neutral-400">
        {mode === AuthMode.SIGN_IN ? (
          <>
            Don't have an account?{" "}
            <button
              onClick={() => setMode(AuthMode.SIGN_UP)}
              className="text-blue-400 hover:text-blue-300"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => setMode(AuthMode.SIGN_IN)}
              className="text-blue-400 hover:text-blue-300"
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] p-4 relative">
      <SquaresBackground />
      
      <div className="w-full max-w-md z-10">
        {isSuccess ? renderSuccessMessage() : renderForm()}
      </div>
    </div>
  );
};

export default AuthPage;
