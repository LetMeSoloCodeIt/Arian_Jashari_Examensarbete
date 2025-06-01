import { Link } from "react-router-dom";
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
import { useAuth } from "@/lib/AuthContext";
import { Icons } from "@/components/icons";
import { Scissors } from "lucide-react";


const allowedAdminEmails = ["admin1@gmail.com", "arianjashari1998@gmail.com"];

export function NavBar() {
  const { currentUser, logOut } = useAuth();
  

  const isAdmin = currentUser ? allowedAdminEmails.includes(currentUser.email || "") : false;

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const userInitial = currentUser?.displayName 
    ? currentUser.displayName[0].toUpperCase() 
    : currentUser?.email?.[0].toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur-md transition-all duration-300">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary transition-colors hover:text-primary/80">
            <Scissors className="h-5 w-5" />
            <span>BokaHos</span>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-offset-background transition-all duration-300 hover:bg-primary/15 hover:ring-2 hover:ring-primary hover:ring-offset-2"
                >
                  <Avatar className="h-10 w-10 border-2 border-transparent transition-all hover:border-primary">
                    {currentUser.photoURL ? (
                      <AvatarImage src={currentUser.photoURL} alt={userInitial} />
                    ) : null}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 overflow-hidden shadow-lg border-primary/10" align="end" forceMount>
                <DropdownMenuLabel className="font-normal bg-primary/5 p-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 border border-primary/20">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium leading-none">{currentUser.displayName || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">{currentUser.email}</p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-1">
                  <DropdownMenuItem className="rounded-md cursor-pointer transition-colors hover:bg-primary/10 focus:bg-primary/10">
                    <Link to="/profile" className="flex w-full items-center">
                      <Icons.user className="mr-2 h-4 w-4 text-primary" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem className="rounded-md cursor-pointer transition-colors hover:bg-primary/10 focus:bg-primary/10">
                      <Link to="/" className="flex w-full items-center" onClick={(e) => {
                        e.preventDefault();
                        window.location.href = "/?admin=true";
                      }}>
                        <Icons.settings className="mr-2 h-4 w-4 text-primary" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="rounded-md cursor-pointer transition-colors hover:bg-primary/10 focus:bg-primary/10">
                    <Link to="/settings" className="flex w-full items-center">
                      <Icons.settings className="mr-2 h-4 w-4 text-primary" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <div className="p-1">
                  <DropdownMenuItem className="rounded-md cursor-pointer transition-colors hover:bg-destructive/10 focus:bg-destructive/10" onClick={handleLogout}>
                    <Icons.logout className="mr-2 h-4 w-4 text-destructive" />
                    <span className="text-destructive">Log out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" className="hover:bg-primary/10 transition-colors" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button className="transition-all duration-300 hover:shadow-md hover:bg-primary/90" asChild>
                <Link to="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
} 