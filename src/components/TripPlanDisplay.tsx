import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Users, DollarSign, Clock, Utensils, Camera, Info } from 'lucide-react';
import { formatINR } from '@/lib/currency';
import type { TripPlan } from '@/integrations/supabase/types';

interface TripPlanDisplayProps {
  plan: TripPlan;
}

const TripPlanDisplay: React.FC<TripPlanDisplayProps> = ({ plan }) => {
  if (!plan) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No trip plan data available</p>
      </div>
    );
  }

  const calculatePercentage = (value: number, total: number): string => {
    if (total === 0) return '0%';
    const percentage = (value / total) * 100;
    return `${percentage.toFixed(1)}%`;
  };

  const totalBudget = plan.totalEstimatedCost || 0;

  const accommodationPercentage = plan.budgetBreakdown?.accommodation?.estimated ? calculatePercentage(plan.budgetBreakdown.accommodation.estimated, totalBudget) : '0%';
  const transportationPercentage = plan.budgetBreakdown?.transportation?.estimated ? calculatePercentage(plan.budgetBreakdown.transportation.estimated, totalBudget) : '0%';
  const foodPercentage = plan.budgetBreakdown?.food?.estimated ? calculatePercentage(plan.budgetBreakdown.food.estimated, totalBudget) : '0%';
  const activitiesPercentage = plan.budgetBreakdown?.activities?.estimated ? calculatePercentage(plan.budgetBreakdown.activities.estimated, totalBudget) : '0%';
  const miscellaneousPercentage = plan.budgetBreakdown?.miscellaneous?.estimated ? calculatePercentage(plan.budgetBreakdown.miscellaneous.estimated, totalBudget) : '0%';

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'accommodation':
        return '🏨';
      case 'transportation':
        return '🚗';
      case 'food':
        return '🍽️';
      case 'activities':
        return '🎯';
      case 'sightseeing':
        return '👁️';
      case 'culture':
        return '🏛️';
      default:
        return '📍';
    }
  };

  const getTimeIcon = (time: string) => {
    const timeStr = time.toLowerCase();
    if (timeStr.includes('morning')) return '🌅';
    if (timeStr.includes('afternoon')) return '☀️';
    if (timeStr.includes('evening')) return '🌆';
    if (timeStr.includes('night')) return '🌙';
    return '⏰';
  };

  return (
    <div className="space-y-6">
      {/* Trip Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Info className="h-5 w-5" />
            Trip Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{plan.summary}</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{plan.dailyItinerary?.length || 0} Days</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <DollarSign className="h-4 w-4" />
              <span>Total: {formatINR(plan.totalEstimatedCost)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>Budget Optimized</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Itinerary */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Daily Itinerary
        </h3>
        {plan.dailyItinerary?.map((day, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="flex items-center justify-between">
                <span className="text-green-800">Day {day.day}: {day.title}</span>
                <Badge variant="outline" className="text-green-700 border-green-300">
                  {day.date}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {day.activities?.map((activity, actIndex) => (
                  <div key={actIndex} className="p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{getTimeIcon(activity.time)}</span>
                          <Badge variant="secondary" className="text-xs">
                            {activity.time}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {getCategoryIcon(activity.category)} {activity.category}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-gray-800 mb-1">{activity.activity}</h4>
                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                          <MapPin className="h-3 w-3" />
                          <span>{activity.location}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          {formatINR(activity.estimatedCost)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-gray-700">Category</th>
                  <th className="text-right p-2 font-medium text-gray-700">Estimated</th>
                  <th className="text-left p-2 font-medium text-gray-700">Notes</th>
                </tr>
              </thead>
              <tbody>
                {plan.budgetBreakdown && Object.entries(plan.budgetBreakdown).map(([category, details]) => (
                  <tr key={category} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium capitalize">{category.replace(/([A-Z])/g, ' $1')}</td>
                    <td className="p-2 text-right font-medium text-green-600">
                      {formatINR(details?.estimated)}
                    </td>
                    <td className="p-2 text-sm text-gray-600">{details?.notes || 'No notes available'}</td>
                  </tr>
                ))}
                <tr className="border-b-2 border-gray-300 bg-gray-50 font-semibold">
                  <td className="p-2">Total Estimated Cost</td>
                  <td className="p-2 text-right text-green-700">
                    {formatINR(plan.totalEstimatedCost)}
                  </td>
                  <td className="p-2"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Transportation */}
      {plan.transportation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Transportation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-md font-semibold text-gray-700">Getting There</h4>
              <p className="text-sm text-gray-600">{plan.transportation.gettingThere}</p>
            </div>
            <div>
              <h4 className="text-md font-semibold text-gray-700">Local Transport</h4>
              <p className="text-sm text-gray-600">
                Modes: {plan.transportation.localTransport.modes.join(', ')}
              </p>
              <p className="text-sm text-gray-600">
                Daily Cost: {formatINR(plan.transportation.localTransport.dailyCost)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accommodation */}
      {plan.accommodation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Accommodation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{plan.accommodation}</p>
          </CardContent>
        </Card>
      )}

      {/* Food Recommendations */}
      {plan.foodRecommendations && plan.foodRecommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Food Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.foodRecommendations.map((food, index) => (
              <div key={index} className="border-b last:border-b-0 pb-3">
                <h4 className="font-medium text-gray-800">{food.name}</h4>
                <p className="text-sm text-gray-600">{food.type} - {food.description}</p>
                <div className="text-sm text-green-600">{formatINR(food.estimatedCost)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Travel Tips */}
      {plan.travelTips && plan.travelTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Travel Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="list-disc list-inside space-y-2">
            {plan.travelTips.map((tip, index) => (
              <li key={index} className="text-gray-700">{tip}</li>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Hidden Gems */}
      {plan.hiddenGems && plan.hiddenGems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Hidden Gems
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan.hiddenGems.map((gem, index) => (
              <div key={index} className="border-b last:border-b-0 pb-3">
                <h4 className="font-medium text-gray-800">{gem.name}</h4>
                <p className="text-sm text-gray-600">{gem.description}</p>
                <div className="text-sm text-gray-600">Location: {gem.location}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TripPlanDisplay;
import { Home } from "lucide-react";
