import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Menu, 
  User, 
  LogOut, 
  ChevronDown,
  X,
  LogIn
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, isAuthenticated, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (hasRole('admin')) return '/admin/dashboard';
    if (hasRole('organizer')) return '/organizer/dashboard';
    if (hasRole('student')) return '/student/dashboard';
    return '/';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xl font-semibold transition-colors hover:text-primary"
        >
          <Calendar className="h-6 w-6" />
          <span>EventHub</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="/events" className="text-sm font-medium transition-colors hover:text-primary">
            Events
          </Link>
          {isAuthenticated ? (
            <>
              <Link 
                to={getDashboardLink()} 
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span className="text-sm font-medium">{user?.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <div className="text-xs bg-secondary text-secondary-foreground rounded px-1 py-0.5 w-fit">
                      {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={getDashboardLink()} className="cursor-pointer">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" /> 
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background/80 backdrop-blur-sm z-40 animate-fade-in">
          <nav className="container flex flex-col py-8 gap-4">
            <Link 
              to="/" 
              className="flex items-center px-4 py-3 hover:bg-accent rounded-md transition-colors"
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link 
              to="/events" 
              className="flex items-center px-4 py-3 hover:bg-accent rounded-md transition-colors"
              onClick={closeMenu}
            >
              Events
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link 
                  to={getDashboardLink()} 
                  className="flex items-center px-4 py-3 hover:bg-accent rounded-md transition-colors"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <div className="border-t my-2" />
                <div className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    {user?.profileImage ? (
                      <img 
                        src={user.profileImage} 
                        alt={user.name} 
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="flex items-center gap-2 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 px-4 py-3">
                <Link to="/login" onClick={closeMenu}>
                  <Button variant="outline" className="w-full">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </Link>
                <Link to="/register" onClick={closeMenu}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
