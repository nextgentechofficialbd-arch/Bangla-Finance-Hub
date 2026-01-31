import { useState } from "react";
import { useSavings, useCreateSaving, useDeleteSaving } from "@/hooks/use-finance";
import { useI18n } from "@/lib/i18n";
import { format } from "date-fns";
import { Plus, Trash2, PiggyBank, Target } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSavingsSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import clsx from "clsx";

export default function Savings() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const { data: savings, isLoading } = useSavings();
  const deleteSaving = useDeleteSaving();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount);
  };

  const totalSavings = savings?.reduce((sum, s) => sum + Number(s.amount), 0) || 0;

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('savings')}</h1>
          <p className="text-sm text-muted-foreground">{t('totalSavings')}: {formatCurrency(totalSavings)}</p>
        </div>
        <AddSavingDialog open={isOpen} onOpenChange={setIsOpen} />
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : savings?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground opacity-50">
             <PiggyBank size={48} className="mb-4" />
             <p>{t('noData')}</p>
          </div>
        ) : (
          savings?.map((item, idx) => (
            <div 
              key={item.id} 
              className="bg-card/50 border border-white/5 p-5 rounded-2xl flex items-center justify-between animate-in hover:bg-card/80 transition-colors"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Target size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">{item.purpose}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{format(new Date(item.date), "dd MMM, yyyy")}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-blue-400">{formatCurrency(Number(item.amount))}</p>
                <button 
                  onClick={() => confirm("Delete this saving?") && deleteSaving.mutate(item.id)} 
                  className="text-xs text-muted-foreground hover:text-red-400 transition-colors mt-1"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AddSavingDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { t } = useI18n();
  const createSaving = useCreateSaving();

  const formSchema = insertSavingsSchema.extend({
    amount: z.coerce.number().min(1),
    date: z.coerce.date(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      purpose: "",
      date: new Date(),
      note: "",
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createSaving.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" className="h-9 w-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20">
          <Plus size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 text-foreground w-[90%] max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t('addSaving')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('purpose')}</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-black/20 border-white/10" placeholder="e.g. New Phone" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('amount')}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="bg-black/20 border-white/10" />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('note')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} className="bg-black/20 border-white/10" placeholder="Optional" />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold" disabled={createSaving.isPending}>
              {createSaving.isPending ? "Adding..." : t('save')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
