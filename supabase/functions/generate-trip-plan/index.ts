
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const prompt = `You are an expert travel planner specializing in India with deep knowledge of accurate Indian pricing. Create a detailed trip plan with realistic costs in Indian Rupees.

Trip Details:
- Destination: ${trip.destination}
- Starting from: ${trip.current_location}
- Duration: ${trip.start_date} to ${trip.end_date}
- Number of people: ${trip.number_of_people}
- Budget: ${trip.budget_range}
- Interests: ${trip.interests}

CRITICAL PRICING GUIDELINES FOR INDIA:
- Trains: AC 3-tier ₹2,500-3,500, Sleeper ₹800-1,200, AC 2-tier ₹4,000-5,500 (Delhi-Mumbai)
- Flights: Domestic ₹4,000-15,000 depending on route and timing
- Hotels: Budget ₹1,000-2,500/night, Mid-range ₹2,500-6,000/night, Luxury ₹6,000+/night
- Food: Street food ₹50-200/meal, Restaurant ₹300-800/meal, Fine dining ₹1,500+/meal
- Local transport: Auto ₹50-200, Taxi ₹200-500, Metro ₹20-60 per trip
- Attractions: Indian citizens ₹25-50, Foreign tourists ₹500-600 for major monuments
- Adjust prices for city tiers - Mumbai/Delhi more expensive than Tier-2/3 cities

Please provide a structured JSON response with the following format:
{
  "title": "Trip title",
  "overview": "Brief trip overview",
  "duration": "X days",
  "totalBudget": "₹X,XXX - ₹X,XXX",
  "highlights": ["highlight1", "highlight2", "highlight3"],
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "Morning/Afternoon/Evening",
          "activity": "Activity description",
          "location": "Location name",
          "cost": "₹XXX",
          "duration": "X hours",
          "tips": "Local tips"
        }
      ],
      "meals": [
        {
          "type": "Breakfast/Lunch/Dinner",
          "suggestion": "Restaurant/dish name",
          "cost": "₹XXX"
        }
      ],
      "accommodation": {
        "type": "Hotel/Hostel category",
        "suggestion": "Accommodation suggestion",
        "cost": "₹XXX per night"
      }
    }
  ],
  "transportation": {
    "mainTransport": {
      "mode": "Train/Flight/Bus",
      "details": "Specific recommendations",
      "cost": "₹XXX",
      "duration": "X hours"
    },
    "localTransport": {
      "modes": ["Metro", "Auto", "Taxi"],
      "dailyCost": "₹XXX"
    }
  },
  "budgetBreakdown": {
    "accommodation": "₹XXX",
    "transportation": "₹XXX",
    "food": "₹XXX",
    "activities": "₹XXX",
    "shopping": "₹XXX",
    "miscellaneous": "₹XXX",
    "total": "₹XXX"
  },
  "expenses": [
    {
      "category": "Transportation",
      "description": "Main transport cost",
      "amount": XXX
    },
    {
      "category": "Accommodation",
      "description": "Total accommodation cost",
      "amount": XXX
    },
    {
      "category": "Food",
      "description": "Total food cost",
      "amount": XXX
    },
    {
      "category": "Activities",
      "description": "Sightseeing and activities",
      "amount": XXX
    }
  ],
  "travelTips": [
    "Local tip 1",
    "Local tip 2",
    "Local tip 3"
  ],
  "packingList": [
    "Essential item 1",
    "Essential item 2"
  ]
}

Use ACCURATE Indian pricing. Avoid inflated costs. Consider seasonal variations and provide practical, realistic suggestions that match the actual cost of travel in India.`;

    console.log('Generating trip plan for:', trip.destination);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
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

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }
    
    let generatedPlan = data.candidates[0].content.parts[0].text;
    
    try {
      const jsonMatch = generatedPlan.match(/```json\s*([\s\S]*?)\s*```/) || 
                       generatedPlan.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const planData = JSON.parse(jsonStr);
        
        console.log('Trip plan generated successfully');
        
        return new Response(JSON.stringify({ plan: planData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.log('Failed to parse JSON, using fallback structure');
      
      const fallbackPlan = {
        title: `Trip to ${trip.destination}`,
        overview: generatedPlan.substring(0, 200) + '...',
        duration: "As planned",
        totalBudget: trip.budget_range || "₹50,000 - ₹1,00,000",
        highlights: ["Explore local attractions", "Experience local culture", "Enjoy regional cuisine"],
        itinerary: [],
        transportation: {
          mainTransport: {
            mode: "To be determined",
            details: "Based on your preferences",
            cost: "₹5,000",
            duration: "Varies"
          }
        },
        budgetBreakdown: {
          accommodation: "₹20,000",
          transportation: "₹15,000",
          food: "₹10,000",
          activities: "₹8,000",
          shopping: "₹5,000",
          miscellaneous: "₹2,000",
          total: "₹60,000"
        },
        expenses: [
          { category: "Transportation", description: "Travel costs", amount: 15000 },
          { category: "Accommodation", description: "Hotel stays", amount: 20000 },
          { category: "Food", description: "Meals and dining", amount: 10000 },
          { category: "Activities", description: "Sightseeing", amount: 8000 }
        ],
        travelTips: ["Book in advance for better rates", "Try local cuisine", "Respect local customs"],
        packingList: ["Comfortable shoes", "Weather-appropriate clothing", "Essential documents"]
      };
      
      return new Response(JSON.stringify({ plan: fallbackPlan }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
  } catch (error) {
    console.error('Error in generate-trip-plan function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
