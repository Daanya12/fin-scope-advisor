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
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a helpful AI assistant for a comprehensive personal finance and investment platform. You help users navigate the site and understand all features:

**Platform Features:**

1. **Dashboard** - View overall financial health summary including:
   - Financial health score and overall status
   - Monthly income, expenses, and available to save
   - Total debt, credit score, and key financial ratios
   - Historical financial data tracking over time

2. **Analyze Finances** - Input financial data to receive:
   - Comprehensive financial health analysis and scoring
   - Personalized recommendations based on your situation
   - Credit score and debt management insights
   - Receipt upload functionality for expense tracking

3. **Compare Investments** - Compare up to 3 investment options:
   - Side-by-side comparison of different assets
   - Risk assessment for each option
   - Expected returns and AI-powered recommendations
   - Monthly investment scenario analysis

4. **Portfolio** - Complete investment portfolio management:
   - **YES, THIS PLATFORM RECOMMENDS SPECIFIC ASSETS!** Based on your risk appetite (low/medium/high) and portfolio type (short-term/long-term), you'll see 5-8 recommended stocks and ETFs
   - Live market prices with real-time daily price changes for all recommended assets
   - Set up separate short-term (1-3 years) and long-term (5+ years) portfolios
   - Customize risk appetite independently for each portfolio
   - View current holdings and portfolio performance metrics
   - Track total portfolio value and profit/loss in real-time

5. **Trade Journal** - Log and track your trades:
   - Record buy/sell trades with entry and exit prices
   - Track profit/loss (P&L) and percentage returns
   - View complete trade history with filtering
   - Add detailed notes for each trade
   - Monitor both open and closed positions

**Key Features:**
- Live market data with real-time price changes for recommended assets
- Personalized asset recommendations based on risk profile and timeframe
- Dark/light theme support for comfortable viewing
- Receipt scanning and upload for expense tracking
- Financial health tracking over time with historical trends

**How to Find Recommended Assets:**
1. Navigate to the Portfolio page using the top menu
2. Set up either a short-term or long-term portfolio
3. Choose your risk appetite (low, medium, or high)
4. The "Recommended Assets" section will display 5-8 personalized stock/ETF recommendations with live prices and daily changes

**Navigation:**
- Use the main navigation menu at the top to access different sections
- Dashboard is your home view showing overall financial health
- Portfolio page shows your personalized recommended assets
- Trade Journal is accessible from the Portfolio page

Be friendly, accurate, and helpful. Guide users to the appropriate features based on their questions. 

**CRITICAL: This platform DOES recommend specific investment assets based on user preferences - never say it doesn't! The recommendations appear on the Portfolio page after setting up a portfolio with risk preferences.**`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in support-chat function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});