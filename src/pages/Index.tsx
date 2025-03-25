
import { VercelV0Chat } from "@/components/VercelV0Chat";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <VercelV0Chat />
      <Toaster />
    </div>
  );
};

export default Index;
