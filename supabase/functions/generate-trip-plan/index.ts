
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

    const prompt = `You are an expert budget travel planner. Create a detailed ${daysDiff}-day trip plan for ${trip.destination} that MUST stay within the STRICT budget of ₹${minBudget.toLocaleString()} to ₹${maxBudget.toLocaleString()}.

CRITICAL REQUIREMENTS:
1. The TOTAL cost MUST be between ₹${minBudget.toLocaleString()} and ₹${maxBudget.toLocaleString()}
2. ALL numbers must be valid integers (no null values)
3. Use realistic pricing based on market rates
4. Calculate exact costs for ${daysDiff} days and ${trip.number_of_people} people

PRICING GUIDELINES (use these as base rates):
- Budget accommodation: ₹1000-₹2500 per night per room
- Mid-range accommodation: ₹2500-₹4000 per night per room
- Transportation (flights): ₹8000-₹15000 per person for domestic, ₹15000-₹30000 for international
- Local transport: ₹200-₹500 per day per person
- Food: ₹300-₹800 per meal per person
- Activities: ₹0-₹1500 per activity per person

Trip Details:
- Destination: ${trip.destination}
- Starting from: ${trip.current_location}
- Duration: ${trip.start_date} to ${trip.end_date} (${daysDiff} days)
- Number of people: ${trip.number_of_people}
- Budget Range: ₹${minBudget.toLocaleString()} - ₹${maxBudget.toLocaleString()}
- Interests: ${trip.interests || 'General sightseeing'}

BUDGET ALLOCATION (as percentage of max budget):
- Accommodation: 40-50% (${Math.floor(maxBudget * 0.4)} - ${Math.floor(maxBudget * 0.5)})
- Transportation: 20-30% (${Math.floor(maxBudget * 0.2)} - ${Math.floor(maxBudget * 0.3)})
- Food: 15-25% (${Math.floor(maxBudget * 0.15)} - ${Math.floor(maxBudget * 0.25)})
- Activities: 10-15% (${Math.floor(maxBudget * 0.1)} - ${Math.floor(maxBudget * 0.15)})
- Miscellaneous: 5-10% (${Math.floor(maxBudget * 0.05)} - ${Math.floor(maxBudget * 0.1)})

MANDATORY: Provide ONLY valid JSON with ALL numeric values as integers (no null, no strings for numbers):

{
  "summary": "Brief overview staying within ₹${minBudget.toLocaleString()}-₹${maxBudget.toLocaleString()} budget",
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
          "estimatedCost": 500,
          "category": "Sightseeing"
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "accommodation": {
      "estimated": 20000,
      "notes": "Specific accommodation details"
    },
    "transportation": {
      "estimated": 15000,
      "notes": "Exact transport costs"
    },
    "food": {
      "estimated": 10000,
      "notes": "Food costs for ${daysDiff} days and ${trip.number_of_people} people"
    },
    "activities": {
      "estimated": 4000,
      "notes": "Activity costs"
    },
    "miscellaneous": {
      "estimated": 1000,
      "notes": "Emergency fund"
    }
  },
  "transportation": {
    "gettingThere": "Specific transport option with cost",
    "localTransport": {
      "modes": ["Bus", "Metro"],
      "dailyCost": 300
    }
  },
  "accommodation": "Specific accommodation recommendations",
  "foodRecommendations": [
    {
      "name": "Restaurant name",
      "type": "Food type",
      "description": "Description",
      "estimatedCost": 400
    }
  ],
  "travelTips": ["Tip 1", "Tip 2"],
  "hiddenGems": [
    {
      "name": "Attraction name",
      "description": "Description",
      "location": "Location"
    }
  ],
  "totalEstimatedCost": 50000
}

CRITICAL: Ensure totalEstimatedCost equals the sum of all budgetBreakdown.estimated values and is within ₹${minBudget.toLocaleString()}-₹${maxBudget.toLocaleString()}. Use ONLY integers, no null values.`;

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

      // Ensure all budget values are valid numbers
      if (planData.budgetBreakdown) {
        Object.keys(planData.budgetBreakdown).forEach(key => {
          if (!planData.budgetBreakdown[key].estimated || isNaN(planData.budgetBreakdown[key].estimated)) {
            planData.budgetBreakdown[key].estimated = 0;
          }
        });
      }

      // Calculate total estimated cost from budget breakdown
      const totalEstimated = Object.values(planData.budgetBreakdown || {}).reduce((sum: number, item: any) => {
        const estimated = typeof item.estimated === 'number' ? item.estimated : 0;
        return sum + estimated;
      }, 0);
      
      console.log(`Generated cost: ₹${totalEstimated.toLocaleString()}, Budget range: ₹${minBudget.toLocaleString()}-₹${maxBudget.toLocaleString()}`);
      
      // If the plan exceeds max budget OR is below min budget, adjust it
      if (totalEstimated > maxBudget || totalEstimated < minBudget) {
        console.warn(`Plan cost ₹${totalEstimated.toLocaleString()} is outside budget range, adjusting...`);
        
        // Calculate target cost (80% of max budget to ensure we stay within range)
        const targetCost = Math.floor(maxBudget * 0.8);
        const adjustmentFactor = targetCost / totalEstimated;
        
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
        planData.summary = `Budget-optimized ${daysDiff}-day trip to ${trip.destination} within your ₹${minBudget.toLocaleString()}-₹${maxBudget.toLocaleString()} budget (Total: ₹${adjustedTotal.toLocaleString()})`;
        
        console.log(`Adjusted total cost: ₹${adjustedTotal.toLocaleString()}`);
      } else {
        planData.totalEstimatedCost = totalEstimated;
      }
      
      console.log(`Trip plan generated successfully with ${planData.dailyItinerary.length} days`);
      console.log(`Final total cost: ₹${planData.totalEstimatedCost?.toLocaleString() || 'N/A'}`);
      
      return new Response(JSON.stringify({ plan: planData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.log('Raw response that failed to parse:', generatedPlan.substring(0, 1000) + '...');
      
      // Generate a realistic budget-compliant fallback
      const targetBudget = Math.floor(maxBudget * 0.8); // 80% of max budget
      const accommodationCost = Math.floor(targetBudget * 0.45); // 45%
      const transportationCost = Math.floor(targetBudget * 0.25); // 25%
      const foodCost = Math.floor(targetBudget * 0.20); // 20%
      const activitiesCost = Math.floor(targetBudget * 0.07); // 7%
      const miscCost = Math.floor(targetBudget * 0.03); // 3%
      
      const fallbackTotal = accommodationCost + transportationCost + foodCost + activitiesCost + miscCost;
      
      const startDate = new Date(trip.start_date);
      const fallbackItinerary = [];
      
      for (let i = 0; i < daysDiff; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        
        fallbackItinerary.push({
          day: i + 1,
          date: currentDate.toISOString().split('T')[0],
          title: `Day ${i + 1} - Explore ${trip.destination}`,
          activities: [
            {
              time: "Morning",
              activity: `Visit attractions in ${trip.destination}`,
              location: `Central ${trip.destination}`,
              estimatedCost: Math.floor(activitiesCost / daysDiff / trip.number_of_people),
              category: "Sightseeing"
            },
            {
              time: "Afternoon",
              activity: "Local lunch",
              location: "Local restaurant",
              estimatedCost: Math.floor(foodCost / daysDiff / trip.number_of_people / 3),
              category: "Food"
            },
            {
              time: "Evening",
              activity: "Explore local areas",
              location: "Local area",
              estimatedCost: Math.floor(activitiesCost / daysDiff / trip.number_of_people / 2),
              category: "Culture"
            }
          ]
        });
      }
      
      const fallbackPlan = {
        summary: `Budget-optimized ${daysDiff}-day trip to ${trip.destination} within ₹${minBudget.toLocaleString()}-₹${maxBudget.toLocaleString()} budget (Total: ₹${fallbackTotal.toLocaleString()})`,
        dailyItinerary: fallbackItinerary,
        budgetBreakdown: {
          accommodation: {
            estimated: accommodationCost,
            notes: `Budget accommodation for ${daysDiff-1} nights`
          },
          transportation: {
            estimated: transportationCost,
            notes: `Transport costs for ${trip.number_of_people} people`
          },
          food: {
            estimated: foodCost,
            notes: `Food costs for ${daysDiff} days and ${trip.number_of_people} people`
          },
          activities: {
            estimated: activitiesCost,
            notes: "Activity and sightseeing costs"
          },
          miscellaneous: {
            estimated: miscCost,
            notes: "Emergency fund and miscellaneous expenses"
          }
        },
        transportation: {
          gettingThere: `Transport from ${trip.current_location} to ${trip.destination}`,
          localTransport: {
            modes: ["Public transport", "Local buses"],
            dailyCost: 300
          }
        },
        accommodation: `Budget accommodation in ${trip.destination}`,
        foodRecommendations: [
          {
            name: "Local budget restaurants",
            type: "Budget dining",
            description: `Affordable ${trip.destination} cuisine`,
            estimatedCost: Math.floor(foodCost / daysDiff / trip.number_of_people / 3)
          }
        ],
        travelTips: [
          `Use public transport for cost savings in ${trip.destination}`,
          "Book accommodation in advance for better rates",
          "Eat at local places for authentic and budget-friendly meals"
        ],
        hiddenGems: [
          {
            name: "Budget-friendly local attractions",
            description: "Explore free and low-cost attractions",
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
