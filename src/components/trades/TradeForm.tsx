import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface TradeFormProps {
  portfolioId: string;
  onSuccess: () => void;
}

export const TradeForm = ({ portfolioId, onSuccess }: TradeFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    assetName: "",
    tradeType: "buy",
    quantity: "",
    entryPrice: "",
    exitPrice: "",
    entryDate: new Date().toISOString().split('T')[0],
    exitDate: "",
    status: "open",
    notes: "",
  });

  const calculatePnL = () => {
    if (formData.exitPrice && formData.entryPrice && formData.quantity) {
      const entry = parseFloat(formData.entryPrice);
      const exit = parseFloat(formData.exitPrice);
      const qty = parseFloat(formData.quantity);
      const pnl = formData.tradeType === "buy" 
        ? (exit - entry) * qty 
        : (entry - exit) * qty;
      const pnlPercent = ((exit - entry) / entry) * 100;
      return { pnl, pnlPercent };
    }
    return { pnl: null, pnlPercent: null };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { pnl, pnlPercent } = calculatePnL();

      const { error } = await supabase.from("trades").insert({
        user_id: user.id,
        portfolio_id: portfolioId,
        symbol: formData.symbol.toUpperCase(),
        asset_name: formData.assetName,
        trade_type: formData.tradeType,
        quantity: parseFloat(formData.quantity),
        entry_price: parseFloat(formData.entryPrice),
        exit_price: formData.exitPrice ? parseFloat(formData.exitPrice) : null,
        entry_date: new Date(formData.entryDate).toISOString(),
        exit_date: formData.exitDate ? new Date(formData.exitDate).toISOString() : null,
        status: formData.status,
        pnl,
        pnl_percent: pnlPercent,
        notes: formData.notes || null,
      });

      if (error) throw error;

      toast({
        title: "Trade Logged",
        description: "Your trade has been successfully recorded.",
      });

      setFormData({
        symbol: "",
        assetName: "",
        tradeType: "buy",
        quantity: "",
        entryPrice: "",
        exitPrice: "",
        entryDate: new Date().toISOString().split('T')[0],
        exitDate: "",
        status: "open",
        notes: "",
      });

      onSuccess();
    } catch (error) {
      console.error("Error logging trade:", error);
      toast({
        title: "Error",
        description: "Failed to log trade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="symbol">Symbol *</Label>
          <Input
            id="symbol"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            placeholder="AAPL"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="assetName">Asset Name</Label>
          <Input
            id="assetName"
            value={formData.assetName}
            onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
            placeholder="Apple Inc."
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tradeType">Trade Type *</Label>
          <Select value={formData.tradeType} onValueChange={(value) => setFormData({ ...formData, tradeType: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            step="0.01"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="10"
            required
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="entryPrice">Entry Price *</Label>
          <Input
            id="entryPrice"
            type="number"
            step="0.01"
            value={formData.entryPrice}
            onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
            placeholder="150.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exitPrice">Exit Price</Label>
          <Input
            id="exitPrice"
            type="number"
            step="0.01"
            value={formData.exitPrice}
            onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
            placeholder="160.00"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="entryDate">Entry Date *</Label>
          <Input
            id="entryDate"
            type="date"
            value={formData.entryDate}
            onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="exitDate">Exit Date</Label>
          <Input
            id="exitDate"
            type="date"
            value={formData.exitDate}
            onChange={(e) => setFormData({ ...formData, exitDate: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status *</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional trade notes..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
            Logging Trade...
          </>
        ) : (
          "Log Trade"
        )}
      </Button>
    </form>
  );
};