
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { trip } = await req.json();
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Calculate trip duration
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const prompt = `You are an expert travel planner with extensive knowledge of destinations worldwide. Create detailed, practical, and engaging travel itineraries that provide real value to travelers.

Create a detailed ${durationDays}-day travel itinerary for a trip to ${trip.destination} from ${trip.current_location}. 

Trip Details:
- Destination: ${trip.destination}
- Starting from: ${trip.current_location}
- Duration: ${durationDays} days (${trip.start_date} to ${trip.end_date})
- Number of travelers: ${trip.number_of_people}
- Budget range: ${trip.budget_range}
- Interests: ${trip.interests || 'General sightseeing'}

Please return your response as a structured JSON object with the following format:
{
  "summary": "Brief overview of the trip",
  "dailyItinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "Day title",
      "activities": [
        {
          "time": "Morning/Afternoon/Evening",
          "activity": "Activity description",
          "location": "Location name",
          "estimatedCost": 50,
          "category": "Activities" // Use: Accommodation, Food, Transportation, Activities, Shopping, Entertainment, Other
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "Accommodation": { "estimated": 500, "notes": "Per person for ${durationDays} days" },
    "Food": { "estimated": 300, "notes": "Local dining and meals" },
    "Transportation": { "estimated": 200, "notes": "Local transport and flights" },
    "Activities": { "estimated": 400, "notes": "Tours and attractions" },
    "Shopping": { "estimated": 150, "notes": "Souvenirs and personal items" },
    "Entertainment": { "estimated": 100, "notes": "Nightlife and shows" },
    "Other": { "estimated": 100, "notes": "Miscellaneous expenses" }
  },
  "transportation": {
    "gettingThere": "How to reach the destination",
    "localTransport": "Local transportation options and tips"
  },
  "accommodation": "Accommodation recommendations within budget",
  "foodRecommendations": [
    {
      "name": "Restaurant/Dish name",
      "type": "Local specialty/Restaurant type",
      "description": "Why it's recommended",
      "estimatedCost": 25
    }
  ],
  "travelTips": [
    "Practical tip 1",
    "Practical tip 2"
  ],
  "hiddenGems": [
    {
      "name": "Hidden gem name",
      "description": "What makes it special",
      "location": "Where to find it"
    }
  ]
}

Make sure all cost estimates are realistic and align with the specified budget range. Provide practical, actionable advice that travelers can actually use.`;

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
    
    // Try to parse as JSON, fallback to plain text if parsing fails
    let structuredPlan;
    try {
      // Clean up the response to extract JSON
      const jsonMatch = generatedPlan.match(/```json\s*([\s\S]*?)\s*```/) || 
                       generatedPlan.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        structuredPlan = JSON.parse(jsonStr);
      } else {
        // Try to parse the entire response as JSON
        structuredPlan = JSON.parse(generatedPlan);
      }
    } catch (parseError) {
      console.log('Failed to parse as JSON, using fallback structure:', parseError);
      // Fallback to a basic structure with the original text
      structuredPlan = {
        summary: `${durationDays}-day trip to ${trip.destination}`,
        plainText: generatedPlan,
        dailyItinerary: [],
        budgetBreakdown: {},
        transportation: { gettingThere: "", localTransport: "" },
        accommodation: "",
        foodRecommendations: [],
        travelTips: [],
        hiddenGems: []
      };
    }

    console.log('Trip plan generated successfully');

    return new Response(JSON.stringify({ 
      plan: structuredPlan,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in generate-trip-plan function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
