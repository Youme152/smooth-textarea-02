import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserPayment: (paymentData: any) => Promise<void>;
}

export const useAuth = (): AuthState => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getSiteUrl = () => {
    return window.location.origin;
  };

  const signUp = async (email: string, password: string, fullName?: string): Promise<void> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${getSiteUrl()}/auth`,
        }
      });

      if (error) {
        throw error;
      }

      if (data?.user?.identities?.length === 0) {
        toast({
          variant: "destructive",
          title: "Email already registered",
          description: "This email is already registered. Please sign in instead.",
        });
        return;
      }

      if (data?.user && !data.user.confirmed_at) {
        toast({
          title: "Account created!",
          description: "You can now sign in with your credentials.",
        });
      } else {
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing up",
        description: error.message || "An error occurred during sign up",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing in",
        description: error.message || "An error occurred during sign in",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message || "An error occurred during sign out",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${getSiteUrl()}/reset-password`,
      });
      if (error) {
        throw error;
      }
      toast({
        title: "Password reset email sent",
        description: "Check your email for the password reset link",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error resetting password",
        description: error.message || "An error occurred during password reset",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserPayment = async (paymentData: any): Promise<void> => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to update payment information",
      });
      return;
    }

    try {
      console.log("Updating payment data for user:", user.id);
      console.log("Payment data:", paymentData);
      
      const { error } = await supabase
        .from('payments_cutmod')
        .upsert({
          user_id: user.id,
          status: paymentData.status || 'active',
          stripe_session_id: paymentData.sessionId,
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error("Error updating payment record:", error);
        throw error;
      }

      toast({
        title: "Payment information updated",
        description: "Your payment details have been saved successfully",
      });
    } catch (error: any) {
      console.error("Failed to update payment information:", error);
      toast({
        variant: "destructive",
        title: "Error saving payment",
        description: error.message || "An error occurred while saving payment information",
      });
      throw error;
    }
  };

  return {
    session,
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateUserPayment
  };
};
