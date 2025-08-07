
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plane, LogOut, User, MapPin, Plus } from 'lucide-react';
import { useNavigate, Link, Outlet } from 'react-router-dom';

const Layout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Travel Planner
              </span>
            </Link>

            {user && (
              <div className="flex items-center space-x-4">
                <Link to="/trip/new">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="h-4 w-4 mr-2" />
                    New Trip
                  </Button>
                </Link>

                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-blue-50">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-700">My Trips</span>
                  </Button>
                </Link>
                
                <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                  <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-32 truncate">
                    {user.email}
                  </span>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
