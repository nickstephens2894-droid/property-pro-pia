import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { CurrencyInput } from "@/components/ui/currency-input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface Investor {
  id: string;
  name: string;
  annual_income: number;
  other_income: number;
  non_taxable_income: number;
  has_medicare_levy: boolean;
}

interface EditInvestorDialogProps {
  investor: Investor;
  onUpdate: (updatedInvestor: Investor) => void;
}

export function EditInvestorDialog({ investor, onUpdate }: EditInvestorDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    name: investor.name,
    annual_income: investor.annual_income,
    other_income: investor.other_income,
    non_taxable_income: investor.non_taxable_income,
    has_medicare_levy: investor.has_medicare_levy
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('investors')
        .update({
          name: formData.name,
          annual_income: formData.annual_income,
          other_income: formData.other_income,
          non_taxable_income: formData.non_taxable_income,
          has_medicare_levy: formData.has_medicare_levy,
          updated_at: new Date().toISOString()
        })
        .eq('id', investor.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      toast.success('Investor updated successfully');
      setOpen(false);
    } catch (error) {
      console.error('Error updating investor:', error);
      toast.error('Failed to update investor');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: investor.name,
      annual_income: investor.annual_income,
      other_income: investor.other_income,
      non_taxable_income: investor.non_taxable_income,
      has_medicare_levy: investor.has_medicare_levy
    });
    setOpen(false);
  };

  const EditInvestorForm = ({ className = "" }: { className?: string }) => (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="text-base"
        />
      </div>
      
      <div>
        <Label htmlFor="annual_income">Annual Income</Label>
        <CurrencyInput
          id="annual_income"
          value={formData.annual_income}
          onChange={(value) => setFormData({ ...formData, annual_income: value })}
          className="text-base"
        />
      </div>
      
      <div>
        <Label htmlFor="other_income">Other Income</Label>
        <CurrencyInput
          id="other_income"
          value={formData.other_income}
          onChange={(value) => setFormData({ ...formData, other_income: value })}
          className="text-base"
        />
      </div>
      
      <div>
        <Label htmlFor="non_taxable_income">Non-taxable Income</Label>
        <CurrencyInput
          id="non_taxable_income"
          value={formData.non_taxable_income}
          onChange={(value) => setFormData({ ...formData, non_taxable_income: value })}
          className="text-base"
        />
      </div>
      
      <div className="flex items-center space-x-3 py-2">
        <Switch
          id="has_medicare_levy"
          checked={formData.has_medicare_levy}
          onCheckedChange={(checked) => setFormData({ ...formData, has_medicare_levy: checked })}
        />
        <Label htmlFor="has_medicare_levy" className="text-base">Has Medicare Levy</Label>
      </div>
      
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Updating...' : 'Update'}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Edit Investor</DrawerTitle>
          </DrawerHeader>
          <EditInvestorForm className="p-4" />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Investor</DialogTitle>
        </DialogHeader>
        <EditInvestorForm className="" />
      </DialogContent>
    </Dialog>
  );
}