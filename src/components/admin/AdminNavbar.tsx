import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/lib/toast";
import { adminPrimaryNavRoutes, adminUserMenuRoutes } from "@/config/adminRoutes";
import { filterRoutesByPermission } from "@/lib/adminPermissions";

const AdminNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const visiblePrimaryRoutes = filterRoutesByPermission(adminPrimaryNavRoutes, user);
  const visibleUserMenuRoutes = filterRoutesByPermission(adminUserMenuRoutes, user);

  const isActive = (path: string) => location.pathname === path;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-onerpm-dark-blue to-black border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/admin" className="flex items-center">
            <img 
              src="https://ik.imagekit.io/wuygwau6s/XDistro.png" 
              alt="XDistro Music Admin" 
              className="h-10"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {visiblePrimaryRoutes.map((route) => (
              <Link 
                key={route.path}
                to={route.path} 
                className={`font-medium transition-colors ${
                  isActive(route.path) 
                    ? 'text-onerpm-orange border-b-2 border-onerpm-orange pb-1' 
                    : 'text-white hover:text-onerpm-orange'
                }`}
              >
                {route.label}
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="Toggle admin user menu"
                title="User menu"
                className="flex items-center space-x-2 text-white hover:text-onerpm-orange transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
              >
                <div className="w-8 h-8 bg-onerpm-orange rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div> 
                <ChevronDown className="w-4 h-4" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div> 
                  {visibleUserMenuRoutes.map((route) => {
                    const Icon = route.icon;

                    return (
                      <Link
                        key={route.path}
                        to={route.path}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{route.label}</span>
                      </Link>
                    );
                  })}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-white" 
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close admin navigation" : "Open admin navigation"}
            title={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-700 pt-4">
            <div className="flex flex-col space-y-3">
              {visiblePrimaryRoutes.map((route) => (
                <Link 
                  key={route.path}
                  to={route.path} 
                  className={`font-medium py-2 transition-colors ${
                    isActive(route.path) ? 'text-onerpm-orange' : 'text-white'
                  }`}
                  onClick={toggleMenu}
                >
                  {route.label}
                </Link>
              ))}
              
              {/* Mobile User Info & Logout */}
              <div className="border-t border-gray-700 pt-3 mt-3">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-onerpm-orange rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{user?.name}</p>
                    <p className="text-white/60 text-xs">{user?.email}</p>
                  </div>
                </div>
                {visibleUserMenuRoutes.map((route) => {
                  const Icon = route.icon;

                  return (
                    <Link
                      key={route.path}
                      to={route.path}
                      className="text-white hover:text-onerpm-orange w-full justify-start mb-2 flex items-center py-2"
                      onClick={toggleMenu}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {route.label}
                    </Link>
                  );
                })}
                <Button 
                  variant="ghost" 
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full justify-start"
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default AdminNavbar;