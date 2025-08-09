import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plane, LogOut, User, MapPin, Plus } from 'lucide-react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
const Layout = () => {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <nav className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl group-hover:scale-105 transition-transform duration-200">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AI Trip Planner</span>
            </Link>

            {user && <div className="flex items-center space-x-4">
                <Link to="/trip/new">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-xl">
                    <Plus className="h-4 w-4 mr-2" />
                    New Trip
                  </Button>
                </Link>

                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2 hover:bg-purple-50 text-gray-700 hover:text-purple-700 rounded-xl">
                    <MapPin className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Button>
                </Link>
                
                <div className="flex items-center space-x-3 px-4 py-2 bg-gray-100 rounded-xl">
                  <div className="p-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 max-w-32 truncate">
                    {user.email}
                  </span>
                </div>
                
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200 rounded-xl">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>}
          </div>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>;
};
export default Layout;