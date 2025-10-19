import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface RiskAppetiteEditorProps {
  portfolioId: string;
  currentRiskAppetite: string;
  onUpdate: () => void;
}

export const RiskAppetiteEditor = ({ portfolioId, currentRiskAppetite, onUpdate }: RiskAppetiteEditorProps) => {
  const [riskAppetite, setRiskAppetite] = useState(currentRiskAppetite);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_portfolios")
        .update({ risk_appetite: riskAppetite })
        .eq("id", portfolioId);

      if (error) throw error;

      toast({
        title: "Risk Appetite Updated",
        description: "Your portfolio risk profile has been updated successfully.",
      });
      
      onUpdate();
      setOpen(false);
    } catch (error) {
      console.error("Error updating risk appetite:", error);
      toast({
        title: "Error",
        description: "Failed to update risk appetite. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Change Risk Appetite
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Risk Appetite</DialogTitle>
          <DialogDescription>
            Adjust your risk profile to receive more suitable investment recommendations.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Risk Appetite</Label>
            <Select value={riskAppetite} onValueChange={setRiskAppetite}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Conservative - Minimize risk, prefer stable returns</SelectItem>
                <SelectItem value="medium">Moderate - Balance between risk and return</SelectItem>
                <SelectItem value="high">Aggressive - Higher risk for potential higher returns</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This will affect the investment recommendations you receive
            </p>
          </div>
          <Button onClick={handleUpdate} className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Risk Appetite"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};