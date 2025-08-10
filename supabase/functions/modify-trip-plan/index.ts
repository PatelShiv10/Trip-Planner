
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
    const { tripId, currentPlan, userMessage, conversationHistory } = await req.json();
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const conversationContext = conversationHistory
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join('\n');

    const prompt = `You are an expert AI travel assistant specializing in India and Indian travel costs. Help modify an existing trip plan with accurate Indian pricing.

Current Trip Plan:
${JSON.stringify(currentPlan, null, 2)}

Previous conversation:
${conversationContext}

User's new request: ${userMessage}

CRITICAL PRICING GUIDELINES FOR INDIA:
- Train prices: AC 3-tier Delhi-Mumbai ₹2,500-3,500, Sleeper ₹800-1,200, AC 2-tier ₹4,000-5,500
- Flight prices: Delhi-Mumbai ₹4,000-15,000 depending on timing and airline
- Hotels: Budget ₹1,000-2,500/night, Mid-range ₹2,500-6,000/night, Luxury ₹6,000+/night
- Food: Street food ₹50-200/meal, Restaurant ₹300-800/meal, Fine dining ₹1,500+/meal
- Local transport: Auto-rickshaw ₹50-200, Taxi ₹200-500, Metro ₹20-60
- Attractions: Most monuments ₹25-50 for Indians, ₹500-600 for foreigners

Use these realistic price ranges. Adjust for location - Mumbai/Delhi are more expensive than smaller cities.

Please respond in JSON format with:
{
  "response": "Your conversational response explaining changes with accurate pricing context",
  "updatedPlan": {
    // The modified trip plan with corrected realistic Indian prices
    // Only include this if actually modifying the plan
  }
}

Guidelines:
- Be conversational and helpful
- Use ACCURATE Indian pricing - avoid inflated costs
- Provide realistic alternatives when suggesting changes
- For transportation, consider actual travel times and comfort levels
- Include local insights and tips for better value

Make the response natural and engaging while being helpful about realistic Indian travel costs.`;

    console.log('Modifying trip plan with user request:', userMessage);

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
          maxOutputTokens: 4096,
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
    
    let generatedResponse = data.candidates[0].content.parts[0].text;
    
    try {
      const jsonMatch = generatedResponse.match(/```json\s*([\s\S]*?)\s*```/) || 
                       generatedResponse.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const parsedResponse = JSON.parse(jsonStr);
        
        console.log('Successfully parsed AI response');
        
        return new Response(JSON.stringify(parsedResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else {
        return new Response(JSON.stringify({
          response: generatedResponse,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (parseError) {
      console.log('Failed to parse as JSON, returning plain response:', parseError);
      return new Response(JSON.stringify({
        response: generatedResponse,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
  } catch (error) {
    console.error('Error in modify-trip-plan function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "Sorry, I encountered an error while processing your request. Please try again."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
