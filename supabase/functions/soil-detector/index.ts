import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, state, district } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Soil detection request:', { latitude, longitude, state, district });

    const locationContext = state && district 
      ? `${district}, ${state}, India` 
      : `Latitude: ${latitude}, Longitude: ${longitude} in India`;

    const systemPrompt = `You are an expert agricultural soil scientist specializing in Indian soils. Based on the location provided, determine the most likely soil type found in that region.

Provide your response in the following JSON format only, no additional text:
{
  "soilType": "Name of the soil type",
  "characteristics": [
    "characteristic 1",
    "characteristic 2",
    "characteristic 3",
    "characteristic 4",
    "characteristic 5"
  ],
  "suitableCrops": [
    "crop 1",
    "crop 2", 
    "crop 3",
    "crop 4",
    "crop 5"
  ],
  "tips": "Brief farming tip for this soil type"
}

Consider these major Indian soil types: Alluvial, Black (Regur), Red, Laterite, Desert (Arid), Mountain, Peaty/Marshy, Saline/Alkaline.`;

    const userPrompt = `What is the predominant soil type in ${locationContext}? Provide detailed characteristics and suitable crops.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI usage limit reached. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`Lovable AI error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Lovable AI response received');

    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from the response
    let soilData;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        soilData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Return a fallback response
      soilData = {
        soilType: 'Alluvial Soil',
        characteristics: [
          'Rich in potash, phosphoric acid, and lime',
          'Light to dark in color',
          'Sandy to loamy texture',
          'Good water retention capacity',
          'Highly fertile and productive'
        ],
        suitableCrops: ['Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Jute'],
        tips: 'Add organic matter regularly to maintain soil health.'
      };
    }

    return new Response(JSON.stringify(soilData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in soil-detector function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
