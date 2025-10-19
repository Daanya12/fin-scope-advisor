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
    const { income, expenses, debt, creditScore, month, year, userId } = await req.json();
    
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

    // Fetch historical data if userId is provided
    let historicalContext = '';
    if (userId) {
      try {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data: historicalData } = await supabase
          .from('financial_analyses')
          .select('month, year, financial_score, monthly_income, monthly_expenses, debt_amount, credit_score')
          .eq('user_id', userId)
          .order('year', { ascending: false })
          .order('month', { ascending: false })
          .limit(6);

        if (historicalData && historicalData.length > 0) {
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          historicalContext = '\n\nHistorical Data (last 6 months):\n' + 
            historicalData.map(h => 
              `${monthNames[h.month - 1]} ${h.year}: Score ${h.financial_score}/100, Income £${h.monthly_income}, Expenses £${h.monthly_expenses}, Debt £${h.debt_amount}`
            ).join('\n');
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
      }
    }

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const analysisMonth = month ? `${monthNames[month - 1]} ${year}` : 'Current Month';

    // Prepare AI prompt
    const prompt = `Analyze this financial situation for ${analysisMonth} and provide insights:${historicalContext}

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
3. 3-4 key insights about their financial situation${historicalContext ? ', including trends compared to previous months' : ''}
4. 3-4 specific, actionable recommendations to improve their financial health${historicalContext ? ', considering their progress or regression' : ''}

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
    const result: any = {
      healthScore: analysis.healthScore,
      creditScore: userCreditScore || analysis.estimatedCreditScore,
      debtToIncomeRatio: parseFloat(debtToIncomeRatio),
      creditUtilization: parseFloat(creditUtilization),
      insights: analysis.insights,
      recommendations: analysis.recommendations,
    };

    // ALWAYS generate investment recommendations (even with no disposable income, suggest savings strategies)
    const investmentPrompt = `Based on this financial profile, provide personalized investment and savings recommendations:

Financial Situation:
- Monthly Income: £${monthlyIncome}
- Monthly Expenses: £${monthlyExpenses}
- Monthly Disposable Income: £${disposableIncome}
- Financial Health Score: ${analysis.healthScore}/100
- Credit Score: ${userCreditScore || analysis.estimatedCreditScore}
- Total Debt: £${totalDebt}
- Debt-to-Income Ratio: ${debtToIncomeRatio}%

${disposableIncome > 0 
  ? `The user has £${disposableIncome} available monthly for investing. Provide 3 investment recommendation categories covering different risk levels and time horizons.`
  : `The user has NO disposable income. Focus on: 1) Emergency savings strategies, 2) Debt reduction plans, 3) Future investment preparation when finances improve.`
}

For each category provide:
1. Category name (e.g., "Emergency Fund Building", "Conservative Growth", "High-Growth Tech Portfolio")
2. Risk level (low/medium/high)
3. Time horizon (e.g., "0-1 years", "3-5 years", "5-10 years", "10+ years")
4. Clear reasoning why this suits their profile
5. 3-5 SPECIFIC investment suggestions with actual names (stocks like "Apple (AAPL)", ETFs like "Vanguard S&P 500 (VOO)", savings accounts, bonds)

IMPORTANT RULES:
- If debt is high (>£5000) or DTI >36%, prioritize low-risk options and debt reduction
- If health score <60, focus on building emergency fund first
- If disposable income is low (<£100), suggest micro-investing and savings strategies
- Always include specific, actionable investment names, not generic categories
- Make recommendations realistic for their budget

Format as JSON:
{
  "recommendations": [
    {
      "category": string,
      "riskLevel": "low" | "medium" | "high",
      "timeHorizon": string,
      "reasoning": string,
      "suggestions": [string]
    }
  ]
}`;

    // Generate investment recommendations
    const investmentResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'You are an expert financial investment advisor. Provide specific, actionable investment recommendations with REAL investment names (stocks, ETFs, bonds, etc.). Always respond with valid JSON only, no markdown.'
          },
          {
            role: 'user',
            content: investmentPrompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!investmentResponse.ok) {
      console.error('Investment API error:', await investmentResponse.text());
    } else {
      const investmentData = await investmentResponse.json();
      const investmentContent = investmentData.choices[0].message.content;
      
      try {
        const cleanInvestmentContent = investmentContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const investmentAnalysis = JSON.parse(cleanInvestmentContent);
        result.investmentRecommendations = investmentAnalysis.recommendations;
        console.log('Investment recommendations generated:', result.investmentRecommendations?.length || 0);
      } catch (parseError) {
        console.error('Error parsing investment recommendations:', investmentContent);
        console.error('Parse error:', parseError);
      }
    }

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
