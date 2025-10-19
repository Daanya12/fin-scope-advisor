import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import FinancialCard from "@/components/FinancialCard";
import HealthMeter from "@/components/HealthMeter";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface InvestmentRecommendation {
  category: string;
  suggestions: string[];
  riskLevel: "low" | "medium" | "high";
  timeHorizon: string;
  reasoning: string;
}

interface AnalysisResult {
  healthScore: number;
  creditScore: number;
  debtToIncomeRatio: number;
  creditUtilization: number;
  insights: string[];
  recommendations: string[];
  investmentRecommendations?: InvestmentRecommendation[];
}

const AnalyzeFinances = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const [formData, setFormData] = useState({
    income: "",
    expenses: "",
    debt: "",
    creditScore: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-finances", {
        body: formData,
      });

      if (error) throw error;

      setResult(data);

      // Save to database if user is logged in
      if (user) {
        const monthlyAvailable = parseFloat(formData.income) - parseFloat(formData.expenses);
        
        const { error: saveError } = await supabase
          .from("financial_analyses")
          .insert({
            user_id: user.id,
            monthly_income: parseFloat(formData.income),
            monthly_expenses: parseFloat(formData.expenses),
            credit_score: formData.creditScore ? parseInt(formData.creditScore) : data.creditScore,
            debt_amount: parseFloat(formData.debt),
            financial_score: data.healthScore,
            credit_utilization: data.creditUtilization,
            debt_to_income_ratio: data.debtToIncomeRatio,
            monthly_available: monthlyAvailable,
            recommendations: {
              insights: data.insights,
              actions: data.recommendations,
              investments: data.investmentRecommendations || []
            }
          });

        if (saveError) {
          console.error("Error saving analysis:", saveError);
          toast({
            title: "Analysis Complete!",
            description: "Analysis completed but couldn't be saved to dashboard.",
          });
        } else {
          toast({
            title: "Analysis Complete!",
            description: "Your analysis has been saved to your dashboard.",
          });
          setTimeout(() => navigate("/dashboard"), 2000);
        }
      } else {
        toast({
          title: "Analysis Complete!",
          description: "Sign in to save your results to the dashboard.",
        });
      }
    } catch (error) {
      console.error("Error analyzing finances:", error);
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your finances. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Financial Health Analysis</h1>
          <p className="text-lg text-muted-foreground">
            Enter your financial information to get personalized insights and recommendations
          </p>
        </div>

        <FinancialCard title="Understanding Your Financial Metrics" className="bg-card">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="health-score">
              <AccordionTrigger className="text-left">
                What is a Financial Health Score?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>
                  Your Financial Health Score is a comprehensive measure of your overall financial wellbeing, ranging from 0 to 100. It considers multiple factors including your income, expenses, debt levels, and credit management.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>80-100:</strong> Excellent financial health - strong savings, low debt, good credit management</li>
                  <li><strong>60-79:</strong> Good financial health - manageable debt, positive cash flow, room for improvement</li>
                  <li><strong>Below 60:</strong> Needs attention - consider reviewing spending, reducing debt, or increasing income</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="credit-score">
              <AccordionTrigger className="text-left">
                What is a Credit Score and How Does It Work?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>
                  A credit score is a three-digit number (typically 300-850) that represents your creditworthiness - how likely you are to repay borrowed money. Lenders use this score to decide whether to approve loans and at what interest rate.
                </p>
                <p><strong>Credit Score Ranges:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>800-850:</strong> Exceptional - best loan terms and lowest interest rates</li>
                  <li><strong>740-799:</strong> Very Good - excellent loan approval rates</li>
                  <li><strong>670-739:</strong> Good - favorable loan terms from most lenders</li>
                  <li><strong>580-669:</strong> Fair - may face higher interest rates</li>
                  <li><strong>Below 580:</strong> Poor - difficult to obtain credit, high interest rates</li>
                </ul>
                <p className="mt-2">
                  Your credit score is influenced by payment history, credit utilization, length of credit history, types of credit, and recent credit inquiries.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="debt-to-income">
              <AccordionTrigger className="text-left">
                What is Debt-to-Income Ratio?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>
                  Your Debt-to-Income (DTI) ratio compares your total monthly debt payments to your gross monthly income. It's expressed as a percentage and shows how much of your income goes toward paying debts.
                </p>
                <p><strong>Formula:</strong> (Total Monthly Debt ÷ Gross Monthly Income) × 100</p>
                <p><strong>Important: Understanding "Debt" in Financial Health</strong></p>
                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                  <p className="font-semibold">High-Risk Debt (include in calculations):</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Credit card balances</li>
                    <li>Personal loans</li>
                    <li>Payday loans</li>
                    <li>Car loans (especially high-interest)</li>
                    <li>Student loans with high interest rates</li>
                  </ul>
                  <p className="font-semibold mt-2">Healthy Debt (generally lower risk):</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Mortgages (considered investment in property)</li>
                    <li>Low-interest student loans</li>
                    <li>Business loans generating revenue</li>
                  </ul>
                </div>
                <p><strong>What the numbers mean:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Below 20%:</strong> Excellent - you have significant financial flexibility</li>
                  <li><strong>20-36%:</strong> Good - manageable debt levels</li>
                  <li><strong>37-43%:</strong> Adequate - consider reducing debt when possible</li>
                  <li><strong>Above 43%:</strong> High - may struggle to get approved for loans</li>
                </ul>
                <p className="mt-2">
                  Lenders prefer DTI ratios below 36%, with no more than 28% going toward housing costs.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="credit-utilization">
              <AccordionTrigger className="text-left">
                What is Credit Utilization?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>
                  Credit Utilization is the percentage of your available credit that you're currently using. It's one of the most important factors affecting your credit score.
                </p>
                <p><strong>Formula:</strong> (Total Credit Card Balances ÷ Total Credit Limits) × 100</p>
                <p><strong>Recommended ranges:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li><strong>Below 10%:</strong> Excellent - shows strong credit management</li>
                  <li><strong>10-30%:</strong> Good - generally won't negatively impact your score</li>
                  <li><strong>30-50%:</strong> Fair - may lower your credit score</li>
                  <li><strong>Above 50%:</strong> Poor - can significantly damage your credit score</li>
                </ul>
                <p className="mt-2">
                  <strong>Tip:</strong> Keeping your utilization below 30% across all cards, and ideally below 10%, helps maintain a strong credit score.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </FinancialCard>

        <FinancialCard title="Your Financial Information" gradient>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="income">Monthly Income (£)</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="2500"
                  value={formData.income}
                  onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenses">Monthly Expenses (£)</Label>
                <Input
                  id="expenses"
                  type="number"
                  placeholder="1900"
                  value={formData.expenses}
                  onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="debt">Total Debt (£)</Label>
                <Input
                  id="debt"
                  type="number"
                  placeholder="1200"
                  value={formData.debt}
                  onChange={(e) => setFormData({ ...formData, debt: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditScore">Credit Score (Optional)</Label>
                <Input
                  id="creditScore"
                  type="number"
                  placeholder="720"
                  value={formData.creditScore}
                  onChange={(e) => setFormData({ ...formData, creditScore: e.target.value })}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gradient-primary text-primary-foreground"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 w-4 h-4" />
                  Analyze My Finances
                </>
              )}
            </Button>
          </form>
        </FinancialCard>

        {result && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <FinancialCard title="Your Financial Health Score" gradient>
              <div className="space-y-6">
                <HealthMeter score={result.healthScore} label="Overall Health" size="lg" />
                <HealthMeter score={result.creditScore} label="Credit Score" size="md" />
                
                <div className="grid md:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-sm text-muted-foreground mb-1">Debt-to-Income Ratio</div>
                    <div className="text-2xl font-bold">{result.debtToIncomeRatio}%</div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <div className="text-sm text-muted-foreground mb-1">Credit Utilization</div>
                    <div className="text-2xl font-bold">{result.creditUtilization}%</div>
                  </div>
                </div>
              </div>
            </FinancialCard>

            <FinancialCard title="Key Insights" gradient>
              <ul className="space-y-3">
                {result.insights.map((insight, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{insight}</span>
                  </li>
                ))}
              </ul>
            </FinancialCard>

            <FinancialCard title="Recommended Actions" gradient>
              <ul className="space-y-3">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/10 text-success flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      {index + 1}
                    </div>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </FinancialCard>

            {result.investmentRecommendations && result.investmentRecommendations.length > 0 && (
              <FinancialCard title="Personalized Investment Recommendations" gradient>
                <div className="space-y-6">
                  {result.investmentRecommendations.map((inv, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{inv.category}</h3>
                        <div className="flex gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            inv.riskLevel === "low" ? "bg-success/10 text-success" :
                            inv.riskLevel === "medium" ? "bg-warning/10 text-warning" :
                            "bg-destructive/10 text-destructive"
                          }`}>
                            {inv.riskLevel.toUpperCase()} RISK
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
                            {inv.timeHorizon}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{inv.reasoning}</p>
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Suggested investments:</p>
                        <ul className="space-y-1">
                          {inv.suggestions.map((suggestion, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </FinancialCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzeFinances;
