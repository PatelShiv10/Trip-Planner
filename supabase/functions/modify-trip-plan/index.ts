
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
    const { tripId, currentPlan, userMessage, conversationHistory } = await req.json();
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const conversationContext = conversationHistory
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join('\n');

    const prompt = `You are an AI travel assistant helping to modify an existing trip plan. The user wants to make changes to their current itinerary.

Current Trip Plan:
${JSON.stringify(currentPlan, null, 2)}

Previous conversation:
${conversationContext}

User's new request: ${userMessage}

Please respond in JSON format with:
{
  "response": "Your conversational response to the user explaining what changes you're making",
  "updatedPlan": {
    // The modified trip plan in the same structure as the current plan
    // Only include this if you're actually modifying the plan
    // If you're just answering questions, omit this field
  }
}

Guidelines:
- Be conversational and helpful
- Only modify the plan if the user specifically requests changes
- If modifying costs, use Indian Rupees (₹)
- Maintain the same JSON structure for the updated plan
- For questions or clarifications, just provide the response without updatedPlan

Make the response natural and engaging while being helpful about travel planning.`;

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
    
    // Try to parse as JSON
    try {
      // Clean up the response to extract JSON
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
        // Fallback if JSON parsing fails
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
