import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface UploadingReceipt {
  file: File;
  status: 'uploading' | 'extracting' | 'complete' | 'error';
  amount?: number;
  description?: string;
  error?: string;
}

interface ReceiptUploadProps {
  month: number;
  year: number;
  userId: string | undefined;
  onUploadComplete?: () => void;
}

export const ReceiptUpload = ({ month, year, userId, onUploadComplete }: ReceiptUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadingReceipts, setUploadingReceipts] = useState<UploadingReceipt[]>([]);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to upload receipts.",
        variant: "destructive",
      });
      return;
    }

    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File",
          description: `${file.name} is not an image file.`,
          variant: "destructive",
        });
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds 5MB limit.`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const newReceipts: UploadingReceipt[] = validFiles.map(file => ({
      file,
      status: 'uploading',
    }));

    setUploadingReceipts(prev => [...prev, ...newReceipts]);
    processReceipts(validFiles);
    
    // Reset input
    event.target.value = '';
  };

  const processReceipts = async (files: File[]) => {
    setUploading(true);
    setProgress(0);

    try {
      let completedCount = 0;
      const totalCount = files.length;

      for (const file of files) {
        try {
          // Update status to uploading
          updateReceiptStatus(file.name, 'uploading');

          const fileExt = file.name.split('.').pop();
          const fileName = `${userId}/${Date.now()}_${file.name}`;
          const filePath = `${userId}/${fileName}`;

          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('receipts')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Update status to extracting
          updateReceiptStatus(file.name, 'extracting');

          // Extract data using AI
          const { data: extractData, error: extractError } = await supabase.functions
            .invoke('extract-receipt', {
              body: { imageUrl: filePath }
            });

          if (extractError) {
            console.error('Extract error:', extractError);
            throw new Error('Failed to extract receipt data');
          }

          const amount = extractData?.amount || 0;
          const description = extractData?.description || file.name;

          // Save to database with extracted data
          const { error: dbError } = await supabase
            .from('receipts')
            .insert({
              user_id: userId,
              file_path: filePath,
              file_name: file.name,
              amount,
              description,
              month,
              year,
            });

          if (dbError) throw dbError;

          // Update receipt status to complete
          setUploadingReceipts(prev => prev.map(r => 
            r.file.name === file.name 
              ? { ...r, status: 'complete', amount, description }
              : r
          ));

          completedCount++;
          setProgress((completedCount / totalCount) * 100);

        } catch (error) {
          console.error('Error processing receipt:', error);
          setUploadingReceipts(prev => prev.map(r => 
            r.file.name === file.name 
              ? { ...r, status: 'error', error: 'Failed to process receipt' }
              : r
          ));
        }
      }

      // Update monthly expenses
      await updateMonthlyExpenses();

      toast({
        title: "Receipts Processed",
        description: `${completedCount} of ${totalCount} receipt(s) processed successfully.`,
      });

      onUploadComplete?.();

    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process receipts.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const updateReceiptStatus = (fileName: string, status: UploadingReceipt['status']) => {
    setUploadingReceipts(prev => prev.map(r => 
      r.file.name === fileName ? { ...r, status } : r
    ));
  };

  const updateMonthlyExpenses = async () => {
    try {
      // Get all receipts for this month/year
      const { data: monthReceipts, error: fetchError } = await supabase
        .from('receipts')
        .select('amount')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year);

      if (fetchError) throw fetchError;

      // Calculate total expenses from receipts
      const totalFromReceipts = monthReceipts?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;

      // Check if financial analysis exists for this month/year
      const { data: existingAnalysis } = await supabase
        .from('financial_analyses')
        .select('*')
        .eq('user_id', userId)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();

      if (existingAnalysis) {
        // Update existing analysis
        await supabase
          .from('financial_analyses')
          .update({ 
            monthly_expenses: totalFromReceipts,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAnalysis.id);
      }

      console.log('Updated monthly expenses:', totalFromReceipts);
    } catch (error) {
      console.error('Error updating monthly expenses:', error);
    }
  };

  const removeReceipt = (fileName: string) => {
    setUploadingReceipts(prev => prev.filter(r => r.file.name !== fileName));
  };

  const getStatusIcon = (status: UploadingReceipt['status']) => {
    switch (status) {
      case 'uploading':
      case 'extracting':
        return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusText = (status: UploadingReceipt['status']) => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'extracting':
        return 'Extracting data...';
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Error';
    }
  };

  const totalAmount = uploadingReceipts
    .filter(r => r.status === 'complete')
    .reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="receipt-upload">Upload Receipts</Label>
        <div className="flex items-center gap-2">
          <Input
            id="receipt-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            disabled={uploading || !userId}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={uploading || !userId}
            onClick={() => document.getElementById('receipt-upload')?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Processing..." : "Choose Receipts"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {userId 
            ? "Upload multiple receipt images (PNG, JPG, max 5MB each). AI will extract costs automatically." 
            : "Sign in to upload receipts"}
        </p>
      </div>

      {uploading && uploadingReceipts.length > 0 && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-muted-foreground text-center">
            Processing {uploadingReceipts.filter(r => r.status !== 'complete' && r.status !== 'error').length} of {uploadingReceipts.length} receipts
          </p>
        </div>
      )}

      {uploadingReceipts.length > 0 && (
        <div className="space-y-2">
          <Label>Processing Receipts</Label>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {uploadingReceipts.map((receipt, index) => (
              <Card key={`${receipt.file.name}-${index}`} className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {getStatusIcon(receipt.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{receipt.file.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getStatusText(receipt.status)}
                        {receipt.status === 'complete' && receipt.amount !== undefined && (
                          <span className="ml-2 font-semibold text-primary">£{receipt.amount.toFixed(2)}</span>
                        )}
                      </p>
                      {receipt.description && receipt.status === 'complete' && (
                        <p className="text-xs text-muted-foreground italic mt-1">{receipt.description}</p>
                      )}
                      {receipt.error && (
                        <p className="text-xs text-destructive mt-1">{receipt.error}</p>
                      )}
                    </div>
                  </div>
                  {(receipt.status === 'complete' || receipt.status === 'error') && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeReceipt(receipt.file.name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
          
          {totalAmount > 0 && (
            <Card className="p-3 bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Extracted:</span>
                <span className="text-lg font-bold text-primary">£{totalAmount.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This amount will be added to your monthly expenses
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
