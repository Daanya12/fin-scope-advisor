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
    const { investment1, investment2, investment3, monthlyInvestment } = await req.json();
    
    const investments = [investment1, investment2, investment3].filter(Boolean);
    const monthlyAmount = parseFloat(monthlyInvestment);

    // Prepare AI prompt
    const prompt = `Compare these investment options for someone who can invest £${monthlyAmount} per month:

${investments.map((inv, i) => `${i + 1}. ${inv}`).join('\n')}

For each investment, provide:
- Risk level (Low/Medium/High)
- Expected annual return estimate
- A brief recommendation explaining pros/cons
- A suitability score (0-100) based on the monthly investment amount

Then recommend the best choice overall and explain why.

Format your response as JSON with this structure:
{
  "investments": [
    {
      "name": string,
      "risk": string,
      "expectedReturn": string,
      "recommendation": string,
      "suitability": number
    }
  ],
  "bestChoice": string,
  "reasoning": string
}`;

    // Call Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an investment advisor AI. Provide balanced, realistic advice about investments. Always respond with valid JSON only, no markdown formatting. Base recommendations on risk tolerance and investment timeframe.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    // Parse AI response
    let comparison;
    try {
      // Remove markdown code blocks if present
      const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      comparison = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error parsing AI response:', aiContent);
      throw new Error('Failed to parse AI response');
    }

    return new Response(JSON.stringify(comparison), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in compare-investments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
