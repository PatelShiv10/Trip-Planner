
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

    // Calculate the number of days for the trip
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    const prompt = `You are an expert travel planner specializing in India with deep knowledge of accurate Indian pricing. Create a detailed ${daysDiff}-day trip plan with realistic costs in Indian Rupees.

Trip Details:
- Destination: ${trip.destination}
- Starting from: ${trip.current_location}
- Duration: ${trip.start_date} to ${trip.end_date}
- Number of people: ${trip.number_of_people}
- Budget: ${trip.budget_range}
- Interests: ${trip.interests}

CRITICAL PRICING GUIDELINES FOR INDIA:
- Trains: AC 3-tier ₹1,500-2,500, Sleeper ₹600-900, AC 2-tier ₹2,500-3,500 (Delhi-Mumbai)
- Flights: Domestic ₹3,000-12,000 depending on route and timing
- Hotels: Budget ₹800-2,000/night, Mid-range ₹2,000-5,000/night, Luxury ₹5,000+/night
- Food: Street food ₹30-150/meal, Restaurant ₹200-600/meal, Fine dining ₹1,000+/meal
- Local transport: Auto ₹30-150, Taxi ₹150-400, Metro ₹15-50 per trip
- Attractions: Indian citizens ₹20-40, Foreign tourists ₹200-500 for major monuments
- Adjust prices for city tiers - Mumbai/Delhi more expensive than Tier-2/3 cities

MANDATORY: You MUST provide a complete daily itinerary for all ${daysDiff} days. Each day must have specific activities, timings, and locations.

Please provide a structured JSON response with the following EXACT format:
{
  "summary": "Brief trip overview",
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
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "accommodation": {
      "estimated": 15000,
      "notes": "Budget hotels for ${daysDiff} nights"
    },
    "transportation": {
      "estimated": 8000,
      "notes": "Train/flight + local transport"
    },
    "food": {
      "estimated": 6000,
      "notes": "Mix of street food and restaurants"
    },
    "activities": {
      "estimated": 4000,
      "notes": "Entry fees and experiences"
    }
  },
  "transportation": {
    "gettingThere": "Specific transport recommendation with cost",
    "localTransport": {
      "modes": ["Metro", "Auto-rickshaw", "Taxi"],
      "dailyCost": 200
    }
  },
  "accommodation": "Specific hotel recommendations with areas",
  "foodRecommendations": [
    {
      "name": "Restaurant/dish name",
      "type": "Local/Street Food/Fine Dining",
      "description": "Description of food",
      "estimatedCost": 250
    }
  ],
  "travelTips": [
    "Practical tip 1",
    "Practical tip 2"
  ],
  "hiddenGems": [
    {
      "name": "Hidden gem name",
      "description": "Why it's special",
      "location": "Specific location"
    }
  ]
}

IMPORTANT: 
- Generate activities for ALL ${daysDiff} days
- Include specific timings (Morning, Afternoon, Evening) for each day
- Provide realistic Indian pricing for each activity
- Each day should have 3-5 activities
- Use ONLY the JSON format above, no additional text or markdown`;

    console.log(`Generating ${daysDiff}-day trip plan for:`, trip.destination);

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
    console.log('Raw AI response:', generatedPlan.substring(0, 500) + '...');
    
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
      
      console.log(`Trip plan generated successfully with ${planData.dailyItinerary.length} days`);
      
      return new Response(JSON.stringify({ plan: planData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.log('Raw response that failed to parse:', generatedPlan);
      
      // Generate a more detailed fallback with daily itinerary
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
              estimatedCost: 500,
              category: "Sightseeing"
            },
            {
              time: "Afternoon",
              activity: "Local lunch and cultural exploration",
              location: "Local restaurant",
              estimatedCost: 300,
              category: "Food"
            },
            {
              time: "Evening",
              activity: "Leisure time and local markets",
              location: "Local market area",
              estimatedCost: 200,
              category: "Shopping"
            }
          ]
        });
      }
      
      const fallbackPlan = {
        summary: `${daysDiff}-day trip to ${trip.destination} with daily activities and local experiences`,
        dailyItinerary: fallbackItinerary,
        budgetBreakdown: {
          accommodation: {
            estimated: Math.round(daysDiff * 2000),
            notes: `Budget to mid-range hotels for ${daysDiff} nights`
          },
          transportation: {
            estimated: 8000,
            notes: "Main transport + local travel"
          },
          food: {
            estimated: Math.round(daysDiff * 800),
            notes: "Mix of local and restaurant meals"
          },
          activities: {
            estimated: Math.round(daysDiff * 600),
            notes: "Sightseeing and experiences"
          }
        },
        transportation: {
          gettingThere: `Book train or flight from ${trip.current_location} to ${trip.destination}`,
          localTransport: {
            modes: ["Auto-rickshaw", "Taxi", "Local bus"],
            dailyCost: 200
          }
        },
        accommodation: `Look for hotels in central ${trip.destination} area`,
        foodRecommendations: [
          {
            name: "Local specialties",
            type: "Local cuisine",
            description: `Try authentic ${trip.destination} dishes`,
            estimatedCost: 300
          }
        ],
        travelTips: [
          "Book accommodation in advance for better rates",
          "Try local street food for authentic experience",
          "Carry cash as many local vendors don't accept cards"
        ],
        hiddenGems: [
          {
            name: "Local markets",
            description: "Experience authentic local culture",
            location: `Traditional markets in ${trip.destination}`
          }
        ]
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
