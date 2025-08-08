
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Calculate trip duration
    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const prompt = `Create a detailed ${durationDays}-day travel itinerary for a trip to ${trip.destination} from ${trip.current_location}. 

Trip Details:
- Destination: ${trip.destination}
- Starting from: ${trip.current_location}
- Duration: ${durationDays} days (${trip.start_date} to ${trip.end_date})
- Number of travelers: ${trip.number_of_people}
- Budget range: ${trip.budget_range}
- Interests: ${trip.interests || 'General sightseeing'}

Please create a comprehensive itinerary that includes:

1. **Day-by-Day Schedule**: Break down each day with morning, afternoon, and evening activities
2. **Transportation**: How to get there and move around locally
3. **Accommodation**: Suggest types of places to stay within the budget
4. **Must-See Attractions**: Top destinations and experiences
5. **Local Food**: Restaurant recommendations and local dishes to try
6. **Budget Breakdown**: Estimated costs for major categories
7. **Travel Tips**: Local customs, weather considerations, and practical advice
8. **Hidden Gems**: Lesser-known spots that locals recommend

Format the response in a clear, organized manner with headers and bullet points for easy reading. Make it practical and actionable for travelers.`;

    console.log('Generating trip plan for:', trip.destination);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert travel planner with extensive knowledge of destinations worldwide. Create detailed, practical, and engaging travel itineraries that provide real value to travelers.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedPlan = data.choices[0].message.content;

    console.log('Trip plan generated successfully');

    return new Response(JSON.stringify({ 
      plan: generatedPlan,
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
