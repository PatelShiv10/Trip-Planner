import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import TripPlanDisplay from '@/components/TripPlanDisplay';
import { usePDFGeneration } from '@/hooks/usePDFGeneration';
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Edit,
  ArrowLeft,
  FileText,
  Receipt,
  Trash2
} from 'lucide-react';
import { formatINR } from '@/lib/currency';
import type { Database } from '@/integrations/supabase/types';
type Expense = Database['public']['Tables']['expenses']['Row'];

interface TripDetails {
  title: string;
  destination: string;
  start_date: string;
  end_date: string;
  number_of_people: number;
  budget_range: string;
}

const TripDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { generatePDF, isGenerating } = usePDFGeneration();

  const { data: trip, isLoading: tripLoading, error: tripError } = useQuery({
    queryKey: ['trip', id],
    queryFn: async () => {
      if (!id) throw new Error('Trip ID is required');
      
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ['expenses', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('trip_id', id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const handleDeleteTrip = async () => {
    if (!id) return;
    
    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Trip deleted",
        description: "Your trip has been deleted successfully.",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: "Error",
        description: "Failed to delete trip. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePDF = async () => {
    if (!trip) return;
    
    const tripDetails = {
      title: trip.title,
      destination: trip.destination,
      start_date: trip.start_date,
      end_date: trip.end_date,
      number_of_people: trip.number_of_people,
      budget_range: trip.budget_range,
    };

    await generatePDF(trip.ai_generated_plan, expenses, tripDetails);
  };

  if (tripLoading || expensesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (tripError || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {tripError?.message || 'Trip not found'}
            </p>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  let parsedPlan = null;
  try {
    parsedPlan = trip.ai_generated_plan ? JSON.parse(trip.ai_generated_plan) : null;
  } catch (error) {
    console.error('Error parsing trip plan:', error);
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex gap-2">
            <Button 
              onClick={handleGeneratePDF}
              disabled={isGenerating}
              variant="outline"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating PDF...' : 'Generate PDF'}
            </Button>
            <Button 
              onClick={() => navigate(`/trip/${id}/expenses`)}
              variant="outline"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Manage Expenses
            </Button>
            <Button 
              onClick={() => navigate(`/trip/${id}/edit`)}
              variant="outline"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Trip
            </Button>
            <Button 
              onClick={handleDeleteTrip}
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Trip
            </Button>
          </div>
        </div>

        {/* Trip Header */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">{trip.title}</CardTitle>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{trip.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{trip.number_of_people} {trip.number_of_people === 1 ? 'person' : 'people'}</span>
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="text-gray-800">
                {trip.status}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Budget Range
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">{trip.budget_range}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">{formatINR(totalExpenses)}</p>
              <p className="text-sm text-gray-600 mt-1">
                {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'} recorded
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Generated Plan */}
        {parsedPlan ? (
          <TripPlanDisplay plan={parsedPlan} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Trip Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">No AI-generated plan available for this trip.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TripDetail;
