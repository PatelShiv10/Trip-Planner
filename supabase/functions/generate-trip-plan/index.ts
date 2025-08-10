
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

// Retry function with exponential backoff
const retryWithBackoff = async (fn: () => Promise<Response>, maxRetries = 3): Promise<Response> => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fn();
      if (response.ok) {
        return response;
      }
      
      const errorData = await response.text();
      console.log(`Attempt ${i + 1} failed with status ${response.status}:`, errorData);
      
      // If it's a 503 (overloaded), wait and retry
      if (response.status === 503 && i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      throw new Error(`API error: ${response.status} - ${errorData}`);
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const waitTime = Math.pow(2, i) * 1000;
        console.log(`Attempt ${i + 1} failed, waiting ${waitTime}ms before retry:`, error.message);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trip } = await req.json();
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Calculate the number of days for the trip
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    // Parse budget range
    const { min: minBudget, max: maxBudget } = parseBudgetRange(trip.budget_range);
    const targetBudget = Math.floor((minBudget + maxBudget) / 2); // Use middle of range as target

    console.log(`Generating ${daysDiff}-day trip plan for: ${trip.destination}`);
    console.log(`Budget range: ₹${minBudget.toLocaleString()} - ₹${maxBudget.toLocaleString()}`);
    console.log(`Target budget: ₹${targetBudget.toLocaleString()}`);

    const prompt = `You are an expert budget travel planner with deep knowledge of current realistic pricing in ${trip.destination}. Create a detailed ${daysDiff}-day trip plan that MUST stay within the STRICT budget of ₹${minBudget.toLocaleString()} to ₹${maxBudget.toLocaleString()}.

Trip Details:
- Destination: ${trip.destination}
- Starting from: ${trip.current_location}
- Duration: ${trip.start_date} to ${trip.end_date} (${daysDiff} days)
- Number of people: ${trip.number_of_people}
- ABSOLUTE MAXIMUM BUDGET: ₹${maxBudget.toLocaleString()}
- Target Budget: ₹${targetBudget.toLocaleString()}
- Interests: ${trip.interests || 'General sightseeing'}

CRITICAL BUDGET REQUIREMENTS - THIS IS MANDATORY:
- The TOTAL cost MUST NOT exceed ₹${maxBudget.toLocaleString()} under ANY circumstances
- Research and use REALISTIC current budget prices for ${trip.destination}
- If you cannot fit activities within the budget, choose FREE or very low-cost alternatives
- Prioritize budget accommodations (hostels, budget hotels, shared rooms)
- Use public transport, walking, or cheapest transport options
- Focus on street food, local eateries, and cooking if possible
- Choose free attractions, parks, beaches, markets over expensive tourist spots
- The sum of accommodation + transport + food + activities + misc MUST be ≤ ₹${maxBudget.toLocaleString()}

BUDGET ALLOCATION GUIDELINES for ₹${targetBudget.toLocaleString()}:
- Accommodation: Maximum 40% (₹${Math.floor(targetBudget * 0.4).toLocaleString()})
- Transportation: Maximum 25% (₹${Math.floor(targetBudget * 0.25).toLocaleString()})
- Food: Maximum 20% (₹${Math.floor(targetBudget * 0.2).toLocaleString()})
- Activities: Maximum 10% (₹${Math.floor(targetBudget * 0.1).toLocaleString()})
- Miscellaneous: Maximum 5% (₹${Math.floor(targetBudget * 0.05).toLocaleString()})

MANDATORY: Generate activities for ALL ${daysDiff} days with realistic budget pricing.

Please provide a structured JSON response with this EXACT format:
{
  "summary": "Brief overview emphasizing how this plan stays within ₹${minBudget.toLocaleString()}-₹${maxBudget.toLocaleString()} budget",
  "dailyItinerary": [
    {
      "day": 1,
      "date": "${trip.start_date}",
      "title": "Day 1 title with budget focus",
      "activities": [
        {
          "time": "Morning",
          "activity": "Specific budget-friendly activity",
          "location": "Exact location name",
          "estimatedCost": 200,
          "category": "Sightseeing",
          "budgetNote": "Why this fits the budget"
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "accommodation": {
      "estimated": ${Math.floor(targetBudget * 0.4)},
      "notes": "Budget hostels/guesthouses for ${daysDiff} nights - specific recommendations"
    },
    "transportation": {
      "estimated": ${Math.floor(targetBudget * 0.25)},
      "notes": "Cheapest transport from ${trip.current_location} + local public transport"
    },
    "food": {
      "estimated": ${Math.floor(targetBudget * 0.2)},
      "notes": "Street food, local eateries, and budget meals"
    },
    "activities": {
      "estimated": ${Math.floor(targetBudget * 0.1)},
      "notes": "Free attractions and low-cost experiences"
    },
    "miscellaneous": {
      "estimated": ${Math.floor(targetBudget * 0.05)},
      "notes": "Emergency fund and small purchases"
    }
  },
  "transportation": {
    "gettingThere": "Cheapest option from ${trip.current_location} with exact cost",
    "localTransport": {
      "modes": ["Public bus", "Metro", "Walking"],
      "dailyCost": ${Math.floor(targetBudget * 0.25 / daysDiff)}
    }
  },
  "accommodation": "Specific budget hostels/hotels in ${trip.destination} within price range",
  "foodRecommendations": [
    {
      "name": "Specific local food/restaurant",
      "type": "Street Food/Budget",
      "description": "What makes it budget-friendly",
      "estimatedCost": ${Math.floor(targetBudget * 0.2 / (daysDiff * 2))}
    }
  ],
  "travelTips": [
    "Specific tip to save money in ${trip.destination}",
    "How to find budget accommodation",
    "Best free activities in ${trip.destination}"
  ],
  "hiddenGems": [
    {
      "name": "Free/very cheap attraction",
      "description": "Why it's budget-friendly and worth visiting",
      "location": "Exact location"
    }
  ],
  "totalEstimatedCost": ${targetBudget}
}

FINAL VALIDATION - BEFORE RESPONDING:
1. Add up all costs in budgetBreakdown
2. Ensure total is ≤ ₹${maxBudget.toLocaleString()}
3. If over budget, reduce ALL categories proportionally
4. Double-check accommodation costs are realistic for budget travel
5. Verify all activities have realistic costs for ${trip.destination}

Use ONLY the JSON format above, no additional text or markdown. The total MUST be within budget.`;

    const makeApiCall = () => {
      return fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 8192,
          }
        }),
      });
    };

    const response = await retryWithBackoff(makeApiCall);
    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }
    
    let generatedPlan = data.candidates[0].content.parts[0].text;
    console.log('Raw AI response length:', generatedPlan.length);
    
    try {
      // Clean the response to extract JSON
      let jsonStr = generatedPlan;
      
      // Remove markdown code blocks if present
      const jsonMatch = generatedPlan.match(/```json\s*([\s\S]*?)\s*```/) || 
                       generatedPlan.match(/```\s*([\s\S]*?)\s*```/) ||
                       generatedPlan.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        jsonStr = jsonMatch[1] || jsonMatch[0];
      }
      
      // Clean up any extra text before/after JSON
      const startBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      
      if (startBrace !== -1 && lastBrace !== -1) {
        jsonStr = jsonStr.substring(startBrace, lastBrace + 1);
      }
      
      const planData = JSON.parse(jsonStr);
      
      // Validate that we have daily itinerary
      if (!planData.dailyItinerary || !Array.isArray(planData.dailyItinerary) || planData.dailyItinerary.length === 0) {
        console.error('No daily itinerary found in response');
        throw new Error('Daily itinerary missing from AI response');
      }

      // STRICT budget validation and enforcement
      if (planData.budgetBreakdown) {
        const totalCost = Object.values(planData.budgetBreakdown).reduce((sum: number, item: any) => {
          return sum + (typeof item.estimated === 'number' ? item.estimated : 0);
        }, 0);
        
        console.log(`Generated cost: ₹${totalCost.toLocaleString()}, Max budget: ₹${maxBudget.toLocaleString()}`);
        
        // If the plan exceeds budget, force it to fit within budget
        if (totalCost > maxBudget) {
          console.warn(`Plan exceeds budget by ₹${(totalCost - maxBudget).toLocaleString()}, adjusting...`);
          
          // Calculate reduction factor to fit within max budget
          const reductionFactor = (maxBudget * 0.95) / totalCost; // Use 95% of max budget for safety
          
          // Apply reduction to all categories
          Object.keys(planData.budgetBreakdown).forEach(key => {
            if (planData.budgetBreakdown[key].estimated) {
              planData.budgetBreakdown[key].estimated = Math.floor(
                planData.budgetBreakdown[key].estimated * reductionFactor
              );
              planData.budgetBreakdown[key].notes += " (Adjusted to fit budget)";
            }
          });
          
          // Recalculate total
          const adjustedTotal = Object.values(planData.budgetBreakdown).reduce((sum: number, item: any) => {
            return sum + (typeof item.estimated === 'number' ? item.estimated : 0);
          }, 0);
          
          planData.totalEstimatedCost = adjustedTotal;
          planData.summary = `Budget-conscious ${daysDiff}-day trip to ${trip.destination} designed to stay within your ₹${minBudget.toLocaleString()}-₹${maxBudget.toLocaleString()} budget (Total: ₹${adjustedTotal.toLocaleString()})`;
          
          console.log(`Adjusted total cost: ₹${adjustedTotal.toLocaleString()}`);
        } else {
          planData.totalEstimatedCost = totalCost;
        }
      }
      
      console.log(`Trip plan generated successfully with ${planData.dailyItinerary.length} days`);
      console.log(`Final total cost: ₹${planData.totalEstimatedCost?.toLocaleString() || 'N/A'}`);
      
      return new Response(JSON.stringify({ plan: planData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.log('Raw response that failed to parse:', generatedPlan.substring(0, 1000) + '...');
      
      // Generate a strict budget-compliant fallback
      const accommodationCost = Math.floor(targetBudget * 0.4);
      const transportationCost = Math.floor(targetBudget * 0.25);
      const foodCost = Math.floor(targetBudget * 0.2);
      const activitiesCost = Math.floor(targetBudget * 0.1);
      const miscCost = Math.floor(targetBudget * 0.05);
      const fallbackTotal = accommodationCost + transportationCost + foodCost + activitiesCost + miscCost;
      
      const startDate = new Date(trip.start_date);
      const fallbackItinerary = [];
      
      const dailyFoodBudget = Math.floor(foodCost / daysDiff);
      const dailyActivityBudget = Math.floor(activitiesCost / daysDiff);
      
      for (let i = 0; i < daysDiff; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        fallbackItinerary.push({
          day: i + 1,
          date: currentDate.toISOString().split('T')[0],
          title: `Day ${i + 1} - Budget Exploration of ${trip.destination}`,
          activities: [
            {
              time: "Morning",
              activity: `Visit free attractions and public areas in ${trip.destination}`,
              location: `Central ${trip.destination}`,
              estimatedCost: Math.floor(dailyActivityBudget * 0.3),
              category: "Sightseeing",
              budgetNote: "Free or very low-cost attraction"
            },
            {
              time: "Afternoon",
              activity: "Budget local lunch at street food stalls",
              location: "Local food area",
              estimatedCost: Math.floor(dailyFoodBudget * 0.6),
              category: "Food",
              budgetNote: "Affordable local cuisine"
            },
            {
              time: "Evening",
              activity: "Explore local markets and free entertainment",
              location: "Local market area",
              estimatedCost: Math.floor(dailyActivityBudget * 0.2),
              category: "Culture",
              budgetNote: "Free cultural experience"
            }
          ]
        });
      }
      
      const fallbackPlan = {
        summary: `Budget-conscious ${daysDiff}-day trip to ${trip.destination} strictly designed within ₹${minBudget.toLocaleString()}-₹${maxBudget.toLocaleString()} budget (Total: ₹${fallbackTotal.toLocaleString()})`,
        dailyItinerary: fallbackItinerary,
        budgetBreakdown: {
          accommodation: {
            estimated: accommodationCost,
            notes: `Budget hostels/guesthouses for ${daysDiff} nights within your price range`
          },
          transportation: {
            estimated: transportationCost,
            notes: `Cheapest transport from ${trip.current_location} + local public transport`
          },
          food: {
            estimated: foodCost,
            notes: "Street food and budget local meals"
          },
          activities: {
            estimated: activitiesCost,
            notes: "Free attractions and minimal-cost experiences"
          },
          miscellaneous: {
            estimated: miscCost,
            notes: "Emergency fund and small purchases"
          }
        },
        transportation: {
          gettingThere: `Budget transport from ${trip.current_location} to ${trip.destination}`,
          localTransport: {
            modes: ["Public transport", "Walking", "Budget options"],
            dailyCost: Math.floor(transportationCost / daysDiff)
          }
        },
        accommodation: `Budget hostels and guesthouses in ${trip.destination} within ₹${Math.floor(accommodationCost / daysDiff)} per night`,
        foodRecommendations: [
          {
            name: "Local street food",
            type: "Street Food",
            description: `Authentic and budget-friendly ${trip.destination} street food`,
            estimatedCost: Math.floor(dailyFoodBudget * 0.3)
          },
          {
            name: "Local budget restaurants",
            type: "Budget dining",
            description: "Traditional local cuisine at affordable prices",
            estimatedCost: Math.floor(dailyFoodBudget * 0.6)
          }
        ],
        travelTips: [
          `Use public transportation in ${trip.destination} to save money`,
          "Eat at local street food places for authentic and cheaper meals",
          "Look for free walking tours and attractions",
          "Book budget accommodation in advance for better rates"
        ],
        hiddenGems: [
          {
            name: "Free local attractions",
            description: "Explore parks, markets, and cultural sites with no entry fees",
            location: `Free attractions in ${trip.destination}`
          }
        ],
        totalEstimatedCost: fallbackTotal
      };
      
      return new Response(JSON.stringify({ plan: fallbackPlan }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
  } catch (error) {
    console.error('Error in generate-trip-plan function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Please try again. The AI service may be temporarily overloaded.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
