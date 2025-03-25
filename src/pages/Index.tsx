
import { VercelV0Chat } from "@/components/VercelV0Chat";
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  // Get current time to display appropriate greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] text-white p-4">
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-light mb-12">
            <span className="text-orange-500 mr-3">✧</span>
            {getTimeBasedGreeting()}, Friend
          </h1>
        </div>
        <VercelV0Chat />
        <div className="mt-12">
          <h2 className="text-gray-400 flex items-center text-lg mb-4">
            <span className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </span>
            Your recent chats
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              "AI Chat Assistant", 
              "Web Design Project", 
              "UI Component Library"
            ].map((title, index) => (
              <div key={index} className="bg-[#1E1E1E] p-4 rounded-lg cursor-pointer hover:bg-[#2A2A2A] transition-colors">
                <div className="mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-white text-lg font-medium">{title}</h3>
                <p className="text-gray-400 text-sm mt-2">{index + 2} hours ago</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default Index;
