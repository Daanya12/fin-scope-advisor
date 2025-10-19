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
    // Read body once and reuse it
    const body = await req.json();
    const { symbols, action, query, riskAppetite, portfolioType } = body;

    if (action === 'quote') {
      // Get current quotes for symbols
      const quotes = await Promise.all(
        symbols.map(async (symbol: string) => {
          try {
            const response = await fetch(
              `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
            );
            const data = await response.json();
            
            if (!data.chart?.result?.[0]) {
              return null;
            }

            const result = data.chart.result[0];
            const meta = result.meta;
            const quote = result.indicators?.quote?.[0];
            
            return {
              symbol: meta.symbol,
              name: meta.longName || meta.symbol,
              price: meta.regularMarketPrice || 0,
              change: meta.regularMarketChange || 0,
              changePercent: meta.regularMarketChangePercent || 0,
              volume: meta.regularMarketVolume || 0,
              marketCap: meta.marketCap || 0,
              high: quote?.high?.[0] || 0,
              low: quote?.low?.[0] || 0,
            };
          } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
            return null;
          }
        })
      );

      return new Response(
        JSON.stringify({ quotes: quotes.filter(q => q !== null) }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'search') {
      const response = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0`
      );
      const data = await response.json();
      
      const results = data.quotes?.map((q: any) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
        type: q.quoteType,
        exchange: q.exchange,
      })) || [];

      return new Response(
        JSON.stringify({ results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'recommendations') {
      // Define recommendation pools based on risk and portfolio type
      let symbolPool: string[] = [];
      
      if (riskAppetite === 'low') {
        symbolPool = portfolioType === 'short-term' 
          ? ['BND', 'VCSH', 'SHY', 'AGG', 'GOVT'] // Low risk short-term: bonds and treasury
          : ['VOO', 'VTI', 'BND', 'VIG', 'SCHD']; // Low risk long-term: conservative with dividends
      } else if (riskAppetite === 'medium') {
        symbolPool = portfolioType === 'short-term'
          ? ['SPY', 'IWM', 'QQQ', 'DIA', 'VEA'] // Medium risk short-term: balanced
          : ['VTI', 'VOO', 'VXUS', 'VEA', 'VWO']; // Medium risk long-term: diversified
      } else {
        symbolPool = portfolioType === 'short-term'
          ? ['QQQ', 'ARKK', 'TSLA', 'NVDA', 'AMD'] // High risk short-term: growth
          : ['QQQ', 'VUG', 'ARKK', 'TSLA', 'NVDA', 'MSFT', 'GOOGL']; // High risk long-term: aggressive tech
      }

      // Fetch quotes for recommended symbols with 5-day range to get previous close
      const recommendations = await Promise.all(
        symbolPool.slice(0, 8).map(async (symbol) => {
          try {
            const response = await fetch(
              `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5d`
            );
            const data = await response.json();
            
            if (!data.chart?.result?.[0]) {
              console.error(`No data for ${symbol}`);
              return null;
            }

            const result = data.chart.result[0];
            const meta = result.meta;
            const timestamps = result.timestamp || [];
            const closes = result.indicators?.quote?.[0]?.close || [];
            
            // Get current price
            const currentPrice = meta.regularMarketPrice || closes[closes.length - 1] || 0;
            
            // Get previous day's close (second to last close value)
            let previousClose = currentPrice;
            if (closes.length >= 2) {
              // Find the last valid close before the current one
              for (let i = closes.length - 2; i >= 0; i--) {
                if (closes[i] != null && closes[i] > 0) {
                  previousClose = closes[i];
                  break;
                }
              }
            }
            
            // Calculate change and percentage
            const change = currentPrice - previousClose;
            const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;
            
            console.log(`${symbol}: current=${currentPrice}, previous=${previousClose}, change=${change}, changePercent=${changePercent}`);
            
            return {
              symbol: meta.symbol,
              name: meta.longName || meta.symbol,
              price: currentPrice,
              change: change,
              changePercent: changePercent,
              type: symbol.length <= 5 && !symbol.includes('.') ? 'stock' : 'etf',
            };
          } catch (error) {
            console.error(`Error fetching ${symbol}:`, error);
            return null;
          }
        })
      );

      const validRecommendations = recommendations.filter(r => r !== null);
      console.log(`Returning ${validRecommendations.length} recommendations`);

      return new Response(
        JSON.stringify({ recommendations: validRecommendations }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in yahoo-finance function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
