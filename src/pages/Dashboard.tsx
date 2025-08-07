
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MapPin, Calendar, Users, DollarSign, Sparkles, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface Trip {
  id: string;
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  number_of_people: number;
  budget_range: string;
  status: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTrips(data || []);
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast.error('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getBudgetColor = (budget: string) => {
    switch (budget) {
      case 'budget': return 'text-green-600';
      case 'mid-range': return 'text-yellow-600';
      case 'luxury': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Plane className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your amazing trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-2">
              <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mr-3">
                <Sparkles className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-sm font-semibold text-blue-600">Dashboard</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
              Your Travel Adventures
            </h1>
            <p className="text-gray-600 text-lg">
              Plan, organize, and track your amazing journeys with AI assistance
            </p>
          </div>
          
          <Link to="/trip/new">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-5 w-5 mr-2" />
              Plan New Trip
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {trips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-600 rounded-xl">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Total Trips</p>
                  <p className="text-2xl font-bold text-blue-900">{trips.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-600 rounded-xl">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Active Trips</p>
                  <p className="text-2xl font-bold text-green-900">
                    {trips.filter(trip => trip.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-600 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Completed</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {trips.filter(trip => trip.status === 'completed').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trips Grid */}
      {trips.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-6">
            <div className="inline-flex p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
              <MapPin className="h-16 w-16 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Your Journey</h2>
          <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
            No trips yet? Let our AI create the perfect adventure tailored just for you.
          </p>
          <Link to="/trip/new">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              Plan Your First Trip
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <Card key={trip.id} className="group hover:shadow-2xl hover:scale-105 transition-all duration-300 border-0 bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center space-x-2 text-lg font-bold text-gray-900 mb-2">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                        <MapPin className="h-4 w-4 text-white" />
                      </div>
                      <span className="truncate">{trip.title}</span>
                    </CardTitle>
                    <CardDescription className="text-gray-600 font-medium">
                      {trip.destination}
                    </CardDescription>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                    {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">
                      {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-gray-600">
                    <Users className="h-4 w-4 text-green-500" />
                    <span className="text-sm">
                      {trip.number_of_people} {trip.number_of_people === 1 ? 'traveler' : 'travelers'}
                    </span>
                  </div>
                  
                  {trip.budget_range && (
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-4 w-4 text-purple-500" />
                      <span className={`text-sm font-medium ${getBudgetColor(trip.budget_range)}`}>
                        {trip.budget_range.charAt(0).toUpperCase() + trip.budget_range.slice(1).replace('-', ' ')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="pt-4">
                  <Link to={`/trip/${trip.id}`}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg group-hover:shadow-lg transition-all duration-200">
                      View Trip Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
