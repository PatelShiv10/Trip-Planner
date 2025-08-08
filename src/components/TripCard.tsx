
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, DollarSign, Eye, Edit } from 'lucide-react';

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

interface TripCardProps {
  trip: Trip;
}

const TripCard: React.FC<TripCardProps> = ({ trip }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'active':
        return 'destructive';
      case 'planned':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    
    if (start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}, ${start.getFullYear()}`;
    }
    
    return `${start.toLocaleDateString('en-US', { ...options, year: 'numeric' })} - ${end.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-gray-200 hover:border-purple-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
              {trip.title}
            </CardTitle>
            <div className="flex items-center space-x-1 text-gray-600 mt-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">{trip.destination}</span>
            </div>
          </div>
          <Badge variant={getStatusColor(trip.status)} className="capitalize">
            {trip.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDateRange(trip.start_date, trip.end_date)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{trip.number_of_people} {trip.number_of_people === 1 ? 'person' : 'people'}</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span className="capitalize">{trip.budget_range?.replace('-', ' ')}</span>
            </div>
          </div>
          
          <div className="flex space-x-2 pt-2">
            <Link to={`/trip/${trip.id}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View
              </Button>
            </Link>
            <Link to={`/trip/${trip.id}/edit`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TripCard;
