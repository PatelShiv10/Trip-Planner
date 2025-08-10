
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

    const prompt = `You are an expert travel planner with deep knowledge of current pricing. Create a detailed ${daysDiff}-day trip plan that STRICTLY stays within the budget of ₹${minBudget.toLocaleString()} to ₹${maxBudget.toLocaleString()}.

Trip Details:
- Destination: ${trip.destination}
- Starting from: ${trip.current_location}
- Duration: ${trip.start_date} to ${trip.end_date} (${daysDiff} days)
- Number of people: ${trip.number_of_people}
- STRICT Budget: ₹${minBudget.toLocaleString()} - ₹${maxBudget.toLocaleString()}
- Target Budget: ₹${targetBudget.toLocaleString()}
- Interests: ${trip.interests || 'General sightseeing'}

CRITICAL BUDGET REQUIREMENTS:
- The TOTAL cost must NOT exceed ₹${maxBudget.toLocaleString()}
- Research current realistic prices for ${trip.destination}
- Adjust all recommendations to fit within the specified budget
- If luxury options don't fit the budget, suggest budget-friendly alternatives
- The sum of all estimated costs must be within the budget range

MANDATORY: You MUST provide a complete daily itinerary for all ${daysDiff} days. Each day must have specific activities, timings, and locations.

Please provide a structured JSON response with the following EXACT format:
{
  "summary": "Brief trip overview emphasizing budget-conscious choices",
  "dailyItinerary": [
    {
      "day": 1,
      "date": "${trip.start_date}",
      "title": "Day 1 title",
      "activities": [
        {
          "time": "Morning",
          "activity": "Activity description",
          "location": "Specific location name",
          "estimatedCost": 500,
          "category": "Sightseeing"
        },
        {
          "time": "Afternoon",
          "activity": "Activity description",
          "location": "Specific location name",
          "estimatedCost": 300,
          "category": "Food"
        },
        {
          "time": "Evening",
          "activity": "Activity description",
          "location": "Specific location name",
          "estimatedCost": 200,
          "category": "Entertainment"
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "accommodation": {
      "estimated": 15000,
      "notes": "Budget-friendly options for ${daysDiff} nights"
    },
    "transportation": {
      "estimated": 8000,
      "notes": "Economic transport options"
    },
    "food": {
      "estimated": 6000,
      "notes": "Mix of local and affordable dining"
    },
    "activities": {
      "estimated": 4000,
      "notes": "Entry fees and experiences within budget"
    },
    "miscellaneous": {
      "estimated": 2000,
      "notes": "Shopping and unexpected expenses"
    }
  },
  "transportation": {
    "gettingThere": "Most economical transport recommendation with cost",
    "localTransport": {
      "modes": ["Budget transport options"],
      "dailyCost": 200
    }
  },
  "accommodation": "Budget-friendly hotel recommendations with specific areas",
  "foodRecommendations": [
    {
      "name": "Restaurant/dish name",
      "type": "Local/Budget/Street Food",
      "description": "Description of food",
      "estimatedCost": 250
    }
  ],
  "travelTips": [
    "Budget-saving tip 1",
    "Budget-saving tip 2",
    "How to stay within budget"
  ],
  "hiddenGems": [
    {
      "name": "Free or low-cost attraction",
      "description": "Why it's special and budget-friendly",
      "location": "Specific location"
    }
  ],
  "totalEstimatedCost": ${targetBudget}
}

IMPORTANT VALIDATION:
- Generate activities for ALL ${daysDiff} days
- Include specific timings (Morning, Afternoon, Evening) for each day
- Each day should have 3-5 activities
- The sum of all budgetBreakdown items must NOT exceed ₹${maxBudget.toLocaleString()}
- Provide realistic current pricing for ${trip.destination}
- Focus on value-for-money options that fit the budget
- Use ONLY the JSON format above, no additional text or markdown`;

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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
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

      // Validate budget doesn't exceed maximum
      if (planData.budgetBreakdown) {
        const totalCost = Object.values(planData.budgetBreakdown).reduce((sum: number, item: any) => {
          return sum + (typeof item.estimated === 'number' ? item.estimated : 0);
        }, 0);
        
        if (totalCost > maxBudget) {
          console.warn(`Generated plan exceeds budget: ₹${totalCost.toLocaleString()} > ₹${maxBudget.toLocaleString()}`);
          // We'll still return it but log the warning
        }
        
        planData.totalEstimatedCost = totalCost;
        console.log(`Total estimated cost: ₹${totalCost.toLocaleString()}`);
      }
      
      console.log(`Trip plan generated successfully with ${planData.dailyItinerary.length} days`);
      
      return new Response(JSON.stringify({ plan: planData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.log('Raw response that failed to parse:', generatedPlan.substring(0, 1000) + '...');
      
      // Generate a detailed fallback with daily itinerary that respects budget
      const budgetPerDay = Math.floor(targetBudget / daysDiff);
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
              activity: `Visit main attractions in ${trip.destination}`,
              location: trip.destination,
              estimatedCost: Math.floor(budgetPerDay * 0.3),
              category: "Sightseeing"
            },
            {
              time: "Afternoon",
              activity: "Local lunch and cultural exploration",
              location: "Local restaurant",
              estimatedCost: Math.floor(budgetPerDay * 0.2),
              category: "Food"
            },
            {
              time: "Evening",
              activity: "Leisure time and local markets",
              location: "Local market area",
              estimatedCost: Math.floor(budgetPerDay * 0.15),
              category: "Shopping"
            }
          ]
        });
      }
      
      const accommodationCost = Math.floor(targetBudget * 0.4);
      const transportationCost = Math.floor(targetBudget * 0.25);
      const foodCost = Math.floor(targetBudget * 0.2);
      const activitiesCost = Math.floor(targetBudget * 0.1);
      const miscCost = targetBudget - accommodationCost - transportationCost - foodCost - activitiesCost;
      
      const fallbackPlan = {
        summary: `${daysDiff}-day budget-conscious trip to ${trip.destination} designed to stay within your budget of ₹${minBudget.toLocaleString()} - ₹${maxBudget.toLocaleString()}`,
        dailyItinerary: fallbackItinerary,
        budgetBreakdown: {
          accommodation: {
            estimated: accommodationCost,
            notes: `Budget accommodation for ${daysDiff} nights within your price range`
          },
          transportation: {
            estimated: transportationCost,
            notes: "Economic transport options from " + trip.current_location
          },
          food: {
            estimated: foodCost,
            notes: "Budget-friendly local meals and dining"
          },
          activities: {
            estimated: activitiesCost,
            notes: "Affordable sightseeing and experiences"
          },
          miscellaneous: {
            estimated: miscCost,
            notes: "Shopping and unexpected expenses"
          }
        },
        transportation: {
          gettingThere: `Budget transport from ${trip.current_location} to ${trip.destination}`,
          localTransport: {
            modes: ["Public transport", "Walking", "Budget taxis"],
            dailyCost: Math.floor(budgetPerDay * 0.1)
          }
        },
        accommodation: `Budget-friendly accommodation in ${trip.destination} within your price range`,
        foodRecommendations: [
          {
            name: "Local street food",
            type: "Street Food",
            description: `Authentic ${trip.destination} street food`,
            estimatedCost: Math.floor(budgetPerDay * 0.1)
          },
          {
            name: "Local restaurant",
            type: "Budget dining",
            description: `Traditional local cuisine at budget prices`,
            estimatedCost: Math.floor(budgetPerDay * 0.15)
          }
        ],
        travelTips: [
          "Use public transportation to save money",
          "Eat at local places for authentic and cheaper meals",
          "Book accommodation in advance for better rates",
          "Look for free walking tours and attractions"
        ],
        hiddenGems: [
          {
            name: "Free local attractions",
            description: "Explore parks, markets, and cultural sites that don't charge entry fees",
            location: `Free attractions in ${trip.destination}`
          }
        ],
        totalEstimatedCost: targetBudget
      };
      
      return new Response(JSON.stringify({ plan: fallbackPlan }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
  } catch (error) {
    console.error('Error in generate-trip-plan function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Please try again in a few moments. The AI service may be temporarily overloaded.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
