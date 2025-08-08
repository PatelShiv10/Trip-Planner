
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Sparkles,
  Plus,
  Receipt
} from 'lucide-react';

interface Trip {
  id: string;
  title: string;
  destination: string;
  current_location: string;
  start_date: string;
  end_date: string;
  number_of_people: number;
  budget_range: string;
  interests: string;
  status: string;
  ai_generated_plan: string;
  created_at: string;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  currency: string;
  date: string;
}

const TripDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  useEffect(() => {
    if (!id || !user) return;
    fetchTripData();
  }, [id, user]);

  const fetchTripData = async () => {
    try {
      // Fetch trip details
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

      if (tripError) throw tripError;
      setTrip(tripData);

      // Fetch trip expenses
      const { data: expenseData, error: expenseError } = await supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', id)
        .order('date', { ascending: false });

      if (expenseError) throw expenseError;
      setExpenses(expenseData || []);
    } catch (error) {
      console.error('Error fetching trip data:', error);
      toast({
        title: "Error",
        description: "Failed to load trip details",
        variant: "destructive"
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const generateAIPlan = async () => {
    if (!trip) return;
    
    setGeneratingPlan(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-trip-plan', {
        body: {
          trip: {
            destination: trip.destination,
            current_location: trip.current_location,
            start_date: trip.start_date,
            end_date: trip.end_date,
            number_of_people: trip.number_of_people,
            budget_range: trip.budget_range,
            interests: trip.interests
          }
        }
      });

      if (error) throw error;

      // Update trip with generated plan
      const { error: updateError } = await supabase
        .from('trips')
        .update({ ai_generated_plan: data.plan })
        .eq('id', id);

      if (updateError) throw updateError;

      setTrip(prev => prev ? { ...prev, ai_generated_plan: data.plan } : null);
      
      toast({
        title: "Success!",
        description: "AI trip plan generated successfully"
      });
    } catch (error) {
      console.error('Error generating AI plan:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI trip plan",
        variant: "destructive"
      });
    } finally {
      setGeneratingPlan(false);
    }
  };

  const deleteTrip = async () => {
    if (!trip || !confirm('Are you sure you want to delete this trip?')) return;

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Trip deleted",
        description: "Your trip has been deleted successfully"
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive"
      });
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Trip not found</h2>
          <Link to="/dashboard">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{trip.title}</h1>
            <div className="flex items-center space-x-4 mt-2 text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{trip.destination}</span>
              </div>
              <Badge variant={trip.status === 'completed' ? 'default' : 'secondary'}>
                {trip.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link to={`/trip/${id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Trip
            </Button>
          </Link>
          <Button variant="destructive" size="sm" onClick={deleteTrip}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trip Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium">{new Date(trip.start_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium">{new Date(trip.end_date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">People</p>
                    <p className="font-medium">{trip.number_of_people}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-medium">{trip.budget_range}</p>
                  </div>
                </div>
              </div>
              {trip.interests && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Interests</p>
                  <p className="text-gray-900">{trip.interests}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Generated Plan */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>AI Trip Plan</span>
              </CardTitle>
              <Button 
                onClick={generateAIPlan} 
                disabled={generatingPlan}
                size="sm"
              >
                {generatingPlan ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    {trip.ai_generated_plan ? 'Regenerate Plan' : 'Generate Plan'}
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {trip.ai_generated_plan ? (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {trip.ai_generated_plan}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No AI plan generated yet</p>
                  <p className="text-sm">Click "Generate Plan" to create an AI-powered itinerary</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Expenses Summary */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-purple-600" />
                <span>Expenses</span>
              </CardTitle>
              <Link to={`/trip/${id}/expenses`}>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-gray-900">
                  ${totalExpenses.toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
              
              {expenses.length > 0 ? (
                <div className="space-y-2">
                  {expenses.slice(0, 5).map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium text-sm">{expense.description}</p>
                        <p className="text-xs text-gray-600">{expense.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${expense.amount.toFixed(2)}</p>
                        <p className="text-xs text-gray-600">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {expenses.length > 5 && (
                    <Link to={`/trip/${id}/expenses`} className="block text-center text-sm text-purple-600 hover:text-purple-700 py-2">
                      View all {expenses.length} expenses
                    </Link>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Receipt className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No expenses yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to={`/trip/${id}/expenses`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Receipt className="h-4 w-4 mr-2" />
                  Manage Expenses
                </Button>
              </Link>
              <Link to={`/trip/${id}/edit`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Trip Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TripDetail;
