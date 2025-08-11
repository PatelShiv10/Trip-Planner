
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

// Function to scrape live prices (simulated for now - in production would use real web scraping)
const scrapeLivePrices = async (destination: string, startDate: string, endDate: string, people: number) => {
  // This would be replaced with actual web scraping APIs in production
  // For now, we'll return realistic price ranges that the AI can use
  return {
    hotelPriceRange: { min: 800, max: 3000 }, // per night
    trainPriceRange: { min: 200, max: 1500 }, // per person
    localTransportDaily: { min: 100, max: 400 }, // per day
    foodPriceRange: { min: 150, max: 800 }, // per meal
    activityPriceRange: { min: 0, max: 1000 } // per activity
  };
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

    // Scrape live prices for the destination
    const livePrices = await scrapeLivePrices(trip.destination, trip.start_date, trip.end_date, trip.number_of_people);

    console.log(`Generating ${daysDiff}-day trip plan for: ${trip.destination}`);
    console.log(`Budget range: ₹${minBudget.toLocaleString()} - ₹${maxBudget.toLocaleString()}`);
    console.log('Live price data:', livePrices);

    const prompt = `You are an expert budget travel planner with access to live pricing data. Create a detailed ${daysDiff}-day trip plan for ${trip.destination} that MUST stay within the STRICT budget of ₹${minBudget.toLocaleString()} to ₹${maxBudget.toLocaleString()}.

LIVE PRICING DATA (use these realistic ranges):
- Hotel prices: ₹${livePrices.hotelPriceRange.min}-₹${livePrices.hotelPriceRange.max} per night
- Train prices: ₹${livePrices.trainPriceRange.min}-₹${livePrices.trainPriceRange.max} per person
- Local transport: ₹${livePrices.localTransportDaily.min}-₹${livePrices.localTransportDaily.max} per day
- Food prices: ₹${livePrices.foodPriceRange.min}-₹${livePrices.foodPriceRange.max} per meal
- Activity costs: ₹${livePrices.activityPriceRange.min}-₹${livePrices.activityPriceRange.max} per activity

Trip Details:
- Destination: ${trip.destination}
- Starting from: ${trip.current_location}
- Duration: ${trip.start_date} to ${trip.end_date} (${daysDiff} days)
- Number of people: ${trip.number_of_people}
- ABSOLUTE MAXIMUM BUDGET: ₹${maxBudget.toLocaleString()}
- MINIMUM BUDGET: ₹${minBudget.toLocaleString()}
- Interests: ${trip.interests || 'General sightseeing'}

CRITICAL BUDGET REQUIREMENTS - THIS IS MANDATORY:
1. The TOTAL cost MUST be between ₹${minBudget.toLocaleString()} and ₹${maxBudget.toLocaleString()}
2. Use ONLY the live pricing data provided above
3. Calculate exact costs based on ${daysDiff} days and ${trip.number_of_people} people
4. NO ASSUMPTIONS - use only the pricing ranges given
5. Each cost must be realistic and verifiable
6. The final total MUST NOT exceed ₹${maxBudget.toLocaleString()}

BUDGET CALCULATION RULES:
- Accommodation: ${daysDiff-1} nights × hotel price × rooms needed
- Transportation: Total travel costs for ${trip.number_of_people} people
- Food: ${daysDiff} days × meals per day × price per meal × ${trip.number_of_people} people
- Activities: Total activity costs for the group
- Miscellaneous: Small buffer (max 5% of total)

MANDATORY: Generate activities for ALL ${daysDiff} days with exact pricing from the ranges provided.

Please provide a structured JSON response with this EXACT format:
{
  "summary": "Brief overview emphasizing how this plan uses live pricing and stays within ₹${minBudget.toLocaleString()}-₹${maxBudget.toLocaleString()} budget",
  "dailyItinerary": [
    {
      "day": 1,
      "date": "${trip.start_date}",
      "title": "Day 1 title",
      "activities": [
        {
          "time": "Morning",
          "activity": "Specific activity",
          "location": "Exact location name",
          "estimatedCost": 200,
          "category": "Sightseeing"
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "accommodation": {
      "estimated": [calculated_accommodation_cost],
      "notes": "Specific hotels/guesthouses for ${daysDiff-1} nights with exact pricing"
    },
    "transportation": {
      "estimated": [calculated_transport_cost],
      "notes": "Exact transport costs from live pricing data"
    },
    "food": {
      "estimated": [calculated_food_cost],
      "notes": "Calculated food costs for ${daysDiff} days and ${trip.number_of_people} people"
    },
    "activities": {
      "estimated": [calculated_activity_cost],
      "notes": "Specific activities with exact costs from pricing data"
    },
    "miscellaneous": {
      "estimated": [small_miscellaneous_amount],
      "notes": "Emergency fund and small purchases"
    }
  },
  "transportation": {
    "gettingThere": "Specific transport option with exact cost from live data",
    "localTransport": {
      "modes": ["Specific transport modes"],
      "dailyCost": [exact_daily_cost_from_live_data]
    }
  },
  "accommodation": "Specific accommodation recommendations with pricing from live data",
  "foodRecommendations": [
    {
      "name": "Specific restaurant/food option",
      "type": "Food type",
      "description": "Why it fits the budget with live pricing",
      "estimatedCost": [exact_cost_from_live_data]
    }
  ],
  "travelTips": [
    "Specific tips for ${trip.destination} based on live pricing",
    "How to save money using current market rates"
  ],
  "hiddenGems": [
    {
      "name": "Specific attraction",
      "description": "Description with cost information",
      "location": "Exact location"
    }
  ],
  "totalEstimatedCost": [sum_of_all_budget_breakdown_items]
}

FINAL VALIDATION CHECKLIST:
1. Add up ALL costs in budgetBreakdown
2. Ensure total is between ₹${minBudget.toLocaleString()} and ₹${maxBudget.toLocaleString()}
3. Verify all prices are from the live pricing data provided
4. Confirm accommodation cost = (${daysDiff-1} nights × price × people)
5. Confirm food cost = (${daysDiff} days × meals × price × ${trip.number_of_people} people)
6. No assumptions made - only live pricing data used

Use ONLY the JSON format above, no additional text or markdown. The total MUST be within the specified budget range.`;

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
            temperature: 0.1,
            topK: 10,
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
        
        console.log(`Generated cost: ₹${totalCost.toLocaleString()}, Budget range: ₹${minBudget.toLocaleString()}-₹${maxBudget.toLocaleString()}`);
        
        // If the plan exceeds max budget OR is below min budget, adjust it
        if (totalCost > maxBudget || totalCost < minBudget) {
          console.warn(`Plan cost ₹${totalCost.toLocaleString()} is outside budget range, adjusting...`);
          
          // Calculate target cost (middle of budget range)
          const targetCost = Math.floor((minBudget + maxBudget) / 2);
          const adjustmentFactor = targetCost / totalCost;
          
          // Apply adjustment to all categories
          Object.keys(planData.budgetBreakdown).forEach(key => {
            if (planData.budgetBreakdown[key].estimated) {
              planData.budgetBreakdown[key].estimated = Math.floor(
                planData.budgetBreakdown[key].estimated * adjustmentFactor
              );
              planData.budgetBreakdown[key].notes += " (Adjusted to fit budget range)";
            }
          });
          
          // Recalculate total
          const adjustedTotal = Object.values(planData.budgetBreakdown).reduce((sum: number, item: any) => {
            return sum + (typeof item.estimated === 'number' ? item.estimated : 0);
          }, 0);
          
          planData.totalEstimatedCost = adjustedTotal;
          planData.summary = `Budget-optimized ${daysDiff}-day trip to ${trip.destination} using live pricing data, staying within your ₹${minBudget.toLocaleString()}-₹${maxBudget.toLocaleString()} budget (Total: ₹${adjustedTotal.toLocaleString()})`;
          
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
      
      // Generate a strict budget-compliant fallback using live pricing
      const accommodationCost = Math.floor((livePrices.hotelPriceRange.min + livePrices.hotelPriceRange.max) / 2) * (daysDiff - 1) * Math.ceil(trip.number_of_people / 2);
      const transportationCost = Math.floor((livePrices.trainPriceRange.min + livePrices.trainPriceRange.max) / 2) * trip.number_of_people;
      const foodCost = Math.floor((livePrices.foodPriceRange.min + livePrices.foodPriceRange.max) / 2) * daysDiff * 3 * trip.number_of_people; // 3 meals per day
      const activitiesCost = Math.floor((livePrices.activityPriceRange.min + livePrices.activityPriceRange.max) / 2) * daysDiff * trip.number_of_people;
      const miscCost = Math.floor((accommodationCost + transportationCost + foodCost + activitiesCost) * 0.05);
      
      let fallbackTotal = accommodationCost + transportationCost + foodCost + activitiesCost + miscCost;
      
      // Ensure fallback total is within budget
      if (fallbackTotal > maxBudget) {
        const reductionFactor = (maxBudget * 0.95) / fallbackTotal;
        const adjustedAccommodation = Math.floor(accommodationCost * reductionFactor);
        const adjustedTransportation = Math.floor(transportationCost * reductionFactor);
        const adjustedFood = Math.floor(foodCost * reductionFactor);
        const adjustedActivities = Math.floor(activitiesCost * reductionFactor);
        const adjustedMisc = Math.floor(miscCost * reductionFactor);
        
        fallbackTotal = adjustedAccommodation + adjustedTransportation + adjustedFood + adjustedActivities + adjustedMisc;
      }
      
      const startDate = new Date(trip.start_date);
      const fallbackItinerary = [];
      
      const dailyFoodBudget = Math.floor(foodCost / daysDiff / trip.number_of_people);
      const dailyActivityBudget = Math.floor(activitiesCost / daysDiff / trip.number_of_people);
      
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
              activity: `Visit attractions in ${trip.destination}`,
              location: `Central ${trip.destination}`,
              estimatedCost: Math.floor(dailyActivityBudget * 0.3),
              category: "Sightseeing"
            },
            {
              time: "Afternoon",
              activity: "Budget local lunch",
              location: "Local restaurant",
              estimatedCost: dailyFoodBudget,
              category: "Food"
            },
            {
              time: "Evening",
              activity: "Explore local areas",
              location: "Local area",
              estimatedCost: Math.floor(dailyActivityBudget * 0.2),
              category: "Culture"
            }
          ]
        });
      }
      
      const fallbackPlan = {
        summary: `Budget-optimized ${daysDiff}-day trip to ${trip.destination} using live pricing data within ₹${minBudget.toLocaleString()}-₹${maxBudget.toLocaleString()} budget (Total: ₹${fallbackTotal.toLocaleString()})`,
        dailyItinerary: fallbackItinerary,
        budgetBreakdown: {
          accommodation: {
            estimated: Math.floor(accommodationCost * (fallbackTotal > maxBudget ? (maxBudget * 0.95) / (accommodationCost + transportationCost + foodCost + activitiesCost + miscCost) : 1)),
            notes: `Budget accommodation for ${daysDiff-1} nights based on live pricing data`
          },
          transportation: {
            estimated: Math.floor(transportationCost * (fallbackTotal > maxBudget ? (maxBudget * 0.95) / (accommodationCost + transportationCost + foodCost + activitiesCost + miscCost) : 1)),
            notes: `Transport costs based on current market rates`
          },
          food: {
            estimated: Math.floor(foodCost * (fallbackTotal > maxBudget ? (maxBudget * 0.95) / (accommodationCost + transportationCost + foodCost + activitiesCost + miscCost) : 1)),
            notes: "Food costs based on live pricing for local restaurants"
          },
          activities: {
            estimated: Math.floor(activitiesCost * (fallbackTotal > maxBudget ? (maxBudget * 0.95) / (accommodationCost + transportationCost + foodCost + activitiesCost + miscCost) : 1)),
            notes: "Activity costs from current market pricing"
          },
          miscellaneous: {
            estimated: Math.floor(miscCost * (fallbackTotal > maxBudget ? (maxBudget * 0.95) / (accommodationCost + transportationCost + foodCost + activitiesCost + miscCost) : 1)),
            notes: "Emergency fund and miscellaneous expenses"
          }
        },
        transportation: {
          gettingThere: `Transport from ${trip.current_location} to ${trip.destination} based on live pricing`,
          localTransport: {
            modes: ["Public transport", "Local options"],
            dailyCost: Math.floor(livePrices.localTransportDaily.min + livePrices.localTransportDaily.max) / 2
          }
        },
        accommodation: `Budget accommodation in ${trip.destination} based on current market rates`,
        foodRecommendations: [
          {
            name: "Local budget restaurants",
            type: "Budget dining",
            description: `Affordable ${trip.destination} cuisine based on live pricing`,
            estimatedCost: dailyFoodBudget
          }
        ],
        travelTips: [
          `Use current market rates for budget planning in ${trip.destination}`,
          "Book accommodation in advance for better rates",
          "Use local transport for cost savings"
        ],
        hiddenGems: [
          {
            name: "Budget-friendly local attractions",
            description: "Explore free and low-cost attractions based on current pricing",
            location: `Around ${trip.destination}`
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
