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
    const { income, expenses, debt, creditScore } = await req.json();
    
    const monthlyIncome = parseFloat(income);
    const monthlyExpenses = parseFloat(expenses);
    const totalDebt = parseFloat(debt);
    const userCreditScore = creditScore ? parseFloat(creditScore) : null;

    // Calculate key metrics
    const disposableIncome = monthlyIncome - monthlyExpenses;
    const debtToIncomeRatio = ((totalDebt / (monthlyIncome * 12)) * 100).toFixed(1);
    const creditUtilization = userCreditScore ? 
      Math.min(((totalDebt / 5000) * 100), 100).toFixed(1) : // Assuming £5000 credit limit
      ((totalDebt / (monthlyIncome * 2)) * 100).toFixed(1);

    // Prepare AI prompt
    const prompt = `Analyze this financial situation and provide insights:

Monthly Income: £${monthlyIncome}
Monthly Expenses: £${monthlyExpenses}
Total Debt: £${totalDebt}
${userCreditScore ? `Credit Score: ${userCreditScore}` : ''}

Disposable Income: £${disposableIncome}
Debt-to-Income Ratio: ${debtToIncomeRatio}%
Credit Utilization: ${creditUtilization}%

Provide:
1. A financial health score (0-100)
2. An estimated credit score if not provided (or validate the provided one)
3. 3-4 key insights about their financial situation
4. 3-4 specific, actionable recommendations to improve their financial health

Format your response as JSON with this structure:
{
  "healthScore": number,
  "estimatedCreditScore": number,
  "insights": [string],
  "recommendations": [string]
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
            content: 'You are a financial advisor AI. Provide clear, actionable advice. Always respond with valid JSON only, no markdown formatting.'
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
    let analysis;
    try {
      // Remove markdown code blocks if present
      const cleanContent = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error parsing AI response:', aiContent);
      throw new Error('Failed to parse AI response');
    }

    // Construct response
    const result = {
      healthScore: analysis.healthScore,
      creditScore: userCreditScore || analysis.estimatedCreditScore,
      debtToIncomeRatio: parseFloat(debtToIncomeRatio),
      creditUtilization: parseFloat(creditUtilization),
      insights: analysis.insights,
      recommendations: analysis.recommendations,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-finances:', error);
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
