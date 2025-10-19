import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";

interface PortfolioSettingsProps {
  userId: string;
  currentRiskAppetite: string;
  onUpdate: () => void;
}

const PortfolioSettings = ({ userId, currentRiskAppetite, onUpdate }: PortfolioSettingsProps) => {
  const [open, setOpen] = useState(false);
  const [riskAppetite, setRiskAppetite] = useState(currentRiskAppetite);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_portfolios")
        .update({ risk_appetite: riskAppetite })
        .eq("user_id", userId);

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Your risk profile has been updated successfully.",
      });

      setOpen(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
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
          Edit Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Portfolio Settings</DialogTitle>
          <DialogDescription>
            Update your risk profile. This will affect recommendations for both your short-term and long-term portfolios.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <Label>Risk Appetite</Label>
            <RadioGroup value={riskAppetite} onValueChange={setRiskAppetite}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="cursor-pointer">
                  <div className="font-medium">Low Risk</div>
                  <div className="text-sm text-muted-foreground">
                    Conservative investments, capital preservation
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="cursor-pointer">
                  <div className="font-medium">Medium Risk</div>
                  <div className="text-sm text-muted-foreground">
                    Balanced approach, moderate growth potential
                  </div>
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="cursor-pointer">
                  <div className="font-medium">High Risk</div>
                  <div className="text-sm text-muted-foreground">
                    Aggressive growth, higher volatility
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioSettings;
