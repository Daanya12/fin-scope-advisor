import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Receipt {
  id: string;
  file_path: string;
  file_name: string;
  amount: number | null;
  description: string | null;
  upload_date: string;
}

interface ReceiptUploadProps {
  month: number;
  year: number;
  userId: string | undefined;
  onUploadComplete?: () => void;
}

export const ReceiptUpload = ({ month, year, userId, onUploadComplete }: ReceiptUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
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

    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save to database
      const { data, error: dbError } = await supabase
        .from('receipts')
        .insert({
          user_id: userId,
          file_path: filePath,
          file_name: file.name,
          month,
          year,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setReceipts([...receipts, data]);
      
      toast({
        title: "Receipt Uploaded",
        description: "Your receipt has been uploaded successfully.",
      });

      onUploadComplete?.();
      
      // Reset input
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload receipt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteReceipt = async (receiptId: string, filePath: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('receipts')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId);

      if (dbError) throw dbError;

      setReceipts(receipts.filter(r => r.id !== receiptId));
      
      toast({
        title: "Receipt Deleted",
        description: "Receipt has been removed.",
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete receipt.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="receipt-upload">Upload Receipt</Label>
        <div className="flex items-center gap-2">
          <Input
            id="receipt-upload"
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading || !userId}
            className="cursor-pointer"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={uploading || !userId}
            onClick={() => document.getElementById('receipt-upload')?.click()}
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {userId 
            ? "Upload receipt images (PNG, JPG, max 5MB)" 
            : "Sign in to upload receipts"}
        </p>
      </div>

      {receipts.length > 0 && (
        <div className="space-y-2">
          <Label>Uploaded Receipts</Label>
          <div className="space-y-2">
            {receipts.map((receipt) => (
              <Card key={receipt.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{receipt.file_name}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteReceipt(receipt.id, receipt.file_path)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
