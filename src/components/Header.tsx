
import { UserMenu } from "@/components/auth/UserMenu";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-md border-b border-neutral-800 shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <a href="/" className="flex items-center gap-2">
            <h1 className="font-playfair font-bold text-2xl text-white">Timeline</h1>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
