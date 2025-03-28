
import { useAuthContext } from "@/components/auth/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubscriptionSettings } from "@/components/SubscriptionSettings";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const SettingsPage = () => {
  const { user, loading } = useAuthContext();

  // If not logged in and not loading, redirect to auth page
  if (!user && !loading) {
    return <Navigate to="/auth" />;
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Tabs defaultValue="subscription" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subscription">
            <SubscriptionSettings />
          </TabsContent>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p><strong>Email:</strong> {user?.email}</p>
                  <p><strong>User ID:</strong> {user?.id}</p>
                  {/* Additional profile fields can be added here */}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

export default SettingsPage;
