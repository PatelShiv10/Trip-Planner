
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

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
}

const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Trip>>({});

  useEffect(() => {
    if (!id || !user) return;
    fetchTrip();
  }, [id, user]);

  const fetchTrip = async () => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      setFormData({
        title: data.title,
        destination: data.destination,
        current_location: data.current_location,
        start_date: data.start_date,
        end_date: data.end_date,
        number_of_people: data.number_of_people,
        budget_range: data.budget_range,
        interests: data.interests,
        status: data.status
      });
    } catch (error) {
      console.error('Error fetching trip:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('trips')
        .update({
          title: formData.title,
          destination: formData.destination,
          current_location: formData.current_location,
          start_date: formData.start_date,
          end_date: formData.end_date,
          number_of_people: formData.number_of_people,
          budget_range: formData.budget_range,
          interests: formData.interests,
          status: formData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Trip updated successfully"
      });
      
      navigate(`/trip/${id}`);
    } catch (error) {
      console.error('Error updating trip:', error);
      toast({
        title: "Error",
        description: "Failed to update trip",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link to={`/trip/${id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trip
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Trip</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trip Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Trip Title</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter trip title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  value={formData.destination || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="Where are you going?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_location">Current Location</Label>
                <Input
                  id="current_location"
                  value={formData.current_location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_location: e.target.value }))}
                  placeholder="Where are you traveling from?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number_of_people">Number of People</Label>
                <Input
                  id="number_of_people"
                  type="number"
                  min="1"
                  value={formData.number_of_people || 1}
                  onChange={(e) => setFormData(prev => ({ ...prev, number_of_people: parseInt(e.target.value) }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_range">Budget Range</Label>
                <Select
                  value={formData.budget_range || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, budget_range: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget ($0-500)</SelectItem>
                    <SelectItem value="mid-range">Mid-range ($500-1500)</SelectItem>
                    <SelectItem value="luxury">Luxury ($1500+)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trip Status</Label>
                <Select
                  value={formData.status || 'draft'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests & Preferences</Label>
              <Textarea
                id="interests"
                value={formData.interests || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                placeholder="What are you interested in? (museums, food, nightlife, nature, etc.)"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6">
              <Link to={`/trip/${id}`}>
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditTrip;
