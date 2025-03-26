
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthContext } from "@/components/auth/AuthContext";
import { Link } from "react-router-dom";

export function UserMenu() {
  const { user, signOut } = useAuthContext();

  if (!user) {
    return (
      <Link to="/auth">
        <Button variant="outline" size="sm" className="bg-neutral-900 border-neutral-700 hover:bg-neutral-800 text-white">
          Sign In
        </Button>
      </Link>
    );
  }

  const initials = user.email
    ? user.email
        .split("@")[0]
        .split(".")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8 border border-neutral-700">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
            <AvatarFallback className="bg-neutral-800 text-white">{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-neutral-900 border-neutral-700 text-white" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || "User"}</p>
            <p className="text-xs leading-none text-neutral-400">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <DropdownMenuItem
          className="hover:bg-neutral-800 cursor-pointer"
          onClick={() => signOut()}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
