
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MapPin, Calendar, Users, DollarSign, Plane, TrendingUp, Globe } from 'lucide-react';
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
      case 'active': return 'bg-purple-100 text-purple-800 border-purple-200';
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Plane className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600 text-lg">Manage your travel adventures</p>
          </div>
          
          <Link to="/trip/new">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              New Trip
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        {trips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Trips</p>
                    <p className="text-3xl font-bold text-gray-900">{trips.length}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Active</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {trips.filter(trip => trip.status === 'active').length}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {trips.filter(trip => trip.status === 'completed').length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Countries</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {new Set(trips.map(trip => trip.destination.split(',').pop()?.trim())).size}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Globe className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trips Section */}
        {trips.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <div className="inline-flex p-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full">
                <Plane className="h-16 w-16 text-purple-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Your Journey</h2>
            <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
              No trips yet? Create your first adventure and let AI plan the perfect itinerary for you.
            </p>
            <Link to="/trip/new">
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Trip
              </Button>
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Trips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trips.map((trip) => (
                <Card key={trip.id} className="group bg-white border-0 shadow-lg rounded-2xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                          {trip.title}
                        </CardTitle>
                        <CardDescription className="text-gray-600 font-medium flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {trip.destination}
                        </CardDescription>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="h-4 w-4 mr-3 text-blue-500" />
                        <span>
                          {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-600 text-sm">
                        <Users className="h-4 w-4 mr-3 text-green-500" />
                        <span>
                          {trip.number_of_people} {trip.number_of_people === 1 ? 'traveler' : 'travelers'}
                        </span>
                      </div>
                      
                      {trip.budget_range && (
                        <div className="flex items-center text-sm">
                          <DollarSign className="h-4 w-4 mr-3 text-purple-500" />
                          <span className={`font-medium ${getBudgetColor(trip.budget_range)}`}>
                            {trip.budget_range.charAt(0).toUpperCase() + trip.budget_range.slice(1).replace('-', ' ')} budget
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4">
                      <Link to={`/trip/${trip.id}`}>
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl group-hover:shadow-lg transition-all duration-200">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
