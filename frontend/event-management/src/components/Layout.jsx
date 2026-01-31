import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Users, Menu, LogOut, LayoutDashboard, Calendar, PlusCircle, 
  Home as HomeIcon, MessageSquare // <--- Import MessageSquare Icon
} from 'lucide-react';
import AuthContext from '../context/AuthContext';

// Shadcn Components
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLink = ({ to, icon: Icon, children }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
        <Icon className="w-4 h-4" />
        {children}
      </Link>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 mx-auto">
        <div className="container flex h-16 items-center mx-auto justify-between">
          
          {/* LOGO & DESKTOP NAV */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary text-primary-foreground p-1 rounded-lg">
                <div className="h-6 w-6 flex items-center justify-center font-bold">E</div>
              </div>
              <span className="font-bold text-xl hidden sm:inline-block">Eventify</span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              <NavLink to="/" icon={HomeIcon}>Home</NavLink>
              <NavLink to="/events" icon={Calendar}>Events</NavLink>
              <NavLink to="/clubs" icon={Users}>Clubs</NavLink>
              {/* --- NEW: MESSAGES LINK (Visible only if logged in) --- */}
              {user && (
                <NavLink to="/messages" icon={MessageSquare}>Messages</NavLink>
              )}

              {user?.role === 'admin' && <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>}
              {(user?.role === 'organizer' || user?.role === 'admin') && <NavLink to="/create-event" icon={PlusCircle}>Create</NavLink>}
            </nav>
          </div>

          {/* RIGHT SIDE (User Menu & Mobile Toggle) */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Shortcut to messages in dropdown too */}
                  <DropdownMenuItem onClick={() => navigate('/messages')} className="cursor-pointer">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex gap-2">
                <Button variant="ghost" asChild><Link to="/login">Login</Link></Button>
                <Button asChild><Link to="/register">Register</Link></Button>
              </div>
            )}

            {/* MOBILE MENU (SHEET) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="flex flex-col gap-4 mt-8">
                  <NavLink to="/" icon={HomeIcon}>Home</NavLink>
                  <NavLink to="/events" icon={Calendar}>Events</NavLink>
                  
                  {/* --- NEW: MOBILE MESSAGES LINK --- */}
                  {user && (
                    <NavLink to="/messages" icon={MessageSquare}>Messages</NavLink>
                  )}

                  {user?.role === 'admin' && <NavLink to="/dashboard" icon={LayoutDashboard}>Dashboard</NavLink>}
                  {user ? (
                    <Button variant="destructive" className="w-full mt-4" onClick={handleLogout}>Logout</Button>
                  ) : (
                    <Button className="w-full mt-4" asChild><Link to="/login">Login</Link></Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 container mx-auto py-6">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="border-t py-6 md:py-0 mx-auto">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built for the campus community. © 2026 Eventify.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;