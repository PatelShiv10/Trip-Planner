import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  DollarSign, 
  Utensils, 
  Car, 
  Bed, 
  Lightbulb,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { formatINR } from '@/lib/currency';

interface Activity {
  time: string;
  activity: string;
  location: string;
  estimatedCost: number;
  category: string;
}

interface DailyItinerary {
  day: number;
  date: string;
  title: string;
  activities: Activity[];
}

interface BudgetItem {
  estimated: number;
  notes: string;
}

interface FoodRecommendation {
  name: string;
  type: string;
  description: string;
  estimatedCost: number;
}

interface HiddenGem {
  name: string;
  description: string;
  location: string;
}

interface LocalTransport {
  modes?: string[];
  dailyCost?: number;
}

interface TripPlan {
  summary: string;
  plainText?: string;
  dailyItinerary: DailyItinerary[];
  budgetBreakdown: Record<string, BudgetItem>;
  transportation: {
    gettingThere: string;
    localTransport: string | LocalTransport;
  };
  accommodation: string;
  foodRecommendations: FoodRecommendation[];
  travelTips: string[];
  hiddenGems: HiddenGem[];
  totalEstimatedCost?: number;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  currency: string;
  date: string;
}

interface TripPlanDisplayProps {
  plan: TripPlan;
  expenses: Expense[];
  tripDetails: {
    title: string;
    destination: string;
    start_date: string;
    end_date: string;
    number_of_people: number;
    budget_range: string;
  };
}

const categoryIcons = {
  Accommodation: Bed,
  Food: Utensils,
  Transportation: Car,
  Activities: Star,
  Shopping: DollarSign,
  Entertainment: Star,
  Miscellaneous: DollarSign,
  Other: DollarSign
};

// Helper function to parse budget range
const parseBudgetRange = (budgetRange: string): { min: number; max: number } => {
  // Handle custom budget ranges like "₹10,000-₹50,000"
  const match = budgetRange.match(/₹([\d,]+)-₹([\d,]+)/);
  if (match) {
    return {
      min: parseInt(match[1].replace(/,/g, '')),
      max: parseInt(match[2].replace(/,/g, ''))
    };
  }
  
  // Handle predefined ranges
  switch (budgetRange.toLowerCase()) {
    case 'budget':
      return { min: 25000, max: 75000 };
    case 'mid-range':
      return { min: 75000, max: 200000 };
    case 'luxury':
      return { min: 200000, max: 500000 };
    default:
      return { min: 25000, max: 75000 };
  }
};

export const TripPlanDisplay: React.FC<TripPlanDisplayProps> = ({ plan, expenses, tripDetails }) => {
  // If we only have plain text (fallback), display it
  if (plan.plainText && plan.dailyItinerary.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Generated Trip Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700">
                {plan.plainText}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Parse the user's budget range
  const { min: userMinBudget, max: userMaxBudget } = parseBudgetRange(tripDetails.budget_range);

  // Calculate total estimated cost from budget breakdown
  const totalEstimated = Object.values(plan.budgetBreakdown).reduce((sum, item) => sum + (item.estimated || 0), 0);
  const totalActual = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Check if the plan is within budget
  const isWithinBudget = totalEstimated >= userMinBudget && totalEstimated <= userMaxBudget;
  const budgetStatus = totalEstimated > userMaxBudget ? 'over' : totalEstimated < userMinBudget ? 'under' : 'within';

  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Helper function to render local transport
  const renderLocalTransport = (localTransport: string | LocalTransport) => {
    if (typeof localTransport === 'string') {
      return <p className="text-gray-700">{localTransport}</p>;
    }
    
    if (typeof localTransport === 'object' && localTransport !== null) {
      return (
        <div className="space-y-2">
          {localTransport.modes && localTransport.modes.length > 0 && (
            <div>
              <span className="font-medium">Available modes: </span>
              <span className="text-gray-700">{localTransport.modes.join(', ')}</span>
            </div>
          )}
          {localTransport.dailyCost && (
            <div>
              <span className="font-medium">Daily cost: </span>
              <span className="text-gray-700">{formatINR(localTransport.dailyCost)}</span>
            </div>
          )}
        </div>
      );
    }
    
    return <p className="text-gray-500">Local transport information not available</p>;
  };

  return (
    <div className="space-y-6 trip-plan-content">
      {/* Summary with Budget Status */}
      {plan.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Trip Summary</span>
              <div className="flex items-center space-x-2">
                {isWithinBudget ? (
                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Within Budget
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {budgetStatus === 'over' ? 'Over Budget' : 'Under Budget'}
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{plan.summary}</p>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Your Budget Range:</span>
                <span className="font-bold text-gray-900">{formatINR(userMinBudget)} - {formatINR(userMaxBudget)}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="font-medium text-gray-700">AI Estimated Cost:</span>
                <span className={`font-bold ${isWithinBudget ? 'text-green-600' : 'text-red-600'}`}>
                  {formatINR(totalEstimated)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Itinerary */}
      {plan.dailyItinerary && plan.dailyItinerary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Daily Itinerary</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {plan.dailyItinerary.map((day) => (
              <div key={day.day} className="border-l-4 border-purple-200 pl-4">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Day {day.day}: {day.title}
                  </h3>
                  <p className="text-sm text-gray-600">{new Date(day.date).toLocaleDateString()}</p>
                </div>
                <div className="space-y-3">
                  {day.activities.map((activity, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <Clock className="h-4 w-4 mt-1 text-purple-600" />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{activity.activity}</p>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                              <span className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {activity.location}
                              </span>
                              <span>{activity.time}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{activity.category}</Badge>
                            <span className="text-sm font-medium">
                              {formatINR(activity.estimatedCost)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Budget Breakdown */}
      {Object.keys(plan.budgetBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Budget Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900">Your Budget Range</h4>
                <p className="text-lg font-bold text-blue-700">{formatINR(userMinBudget)} - {formatINR(userMaxBudget)}</p>
              </div>
              <div className={`p-4 rounded-lg border ${isWithinBudget ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h4 className={`font-medium ${isWithinBudget ? 'text-green-900' : 'text-red-900'}`}>AI Estimated Total</h4>
                <p className={`text-2xl font-bold ${isWithinBudget ? 'text-green-700' : 'text-red-700'}`}>
                  {formatINR(totalEstimated)}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              {Object.entries(plan.budgetBreakdown).map(([category, budget]) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons] || DollarSign;
                
                return (
                  <div key={category} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">{category}</span>
                      </div>
                      <div className="text-right text-sm">
                        <div>Estimated: <span className="font-medium">{formatINR(budget.estimated)}</span></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{budget.notes}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transportation */}
      {(plan.transportation.gettingThere || plan.transportation.localTransport) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Car className="h-5 w-5" />
              <span>Transportation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {plan.transportation.gettingThere && (
              <div>
                <h4 className="font-medium mb-2">Getting There</h4>
                <p className="text-gray-700">{plan.transportation.gettingThere}</p>
              </div>
            )}
            {plan.transportation.localTransport && (
              <div>
                <h4 className="font-medium mb-2">Local Transportation</h4>
                {renderLocalTransport(plan.transportation.localTransport)}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Accommodation */}
      {plan.accommodation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bed className="h-5 w-5" />
              <span>Accommodation</span>
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
            <CardTitle className="flex items-center space-x-2">
              <Utensils className="h-5 w-5" />
              <span>Food Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.foodRecommendations.map((food, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{food.name}</h4>
                    <span className="text-sm font-medium">
                      {formatINR(food.estimatedCost)}
                    </span>
                  </div>
                  <Badge variant="outline" className="mb-2">{food.type}</Badge>
                  <p className="text-sm text-gray-600">{food.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Travel Tips */}
      {plan.travelTips && plan.travelTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="h-5 w-5" />
              <span>Travel Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.travelTips.map((tip, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-purple-600 font-bold">•</span>
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Hidden Gems */}
      {plan.hiddenGems && plan.hiddenGems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Hidden Gems</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {plan.hiddenGems.map((gem, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <h4 className="font-medium mb-1">{gem.name}</h4>
                  <p className="text-sm text-purple-600 mb-2">{gem.location}</p>
                  <p className="text-sm text-gray-700">{gem.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
