import { useState } from "react";
import { useSavings, useCreateSaving, useDeleteSaving } from "@/hooks/use-finance";
import { useI18n } from "@/lib/i18n";
import { format, subMonths, addMonths } from "date-fns";
import { bn, enUS } from "date-fns/locale";
import { Plus, Trash2, PiggyBank, Target, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { getCurrentMonth, getMonthKey } from "@/lib/db";

const savingSchema = z.object({
  purpose: z.string().min(1, "Purpose is required"),
  amount: z.coerce.number().min(1, "Amount is required"),
  date: z.coerce.date(),
  note: z.string().optional(),
});

type SavingForm = z.infer<typeof savingSchema>;

export default function Savings() {
  const { t, language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = getMonthKey(currentDate);
  const isCurrentMonth = currentMonth === getCurrentMonth();
  
  const { data: savings, isLoading } = useSavings(currentMonth);
  const deleteSaving = useDeleteSaving();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'BN' ? 'bn-BD' : 'en-BD', { 
      style: 'currency', 
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalSavings = savings?.reduce((sum, s) => sum + s.amount, 0) || 0;

  const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const locale = language === 'BN' ? bn : enUS;
  const monthDisplay = format(currentDate, "MMMM yyyy", { locale });

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{t('savings')}</h1>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={goToPrevMonth} className="p-1 rounded-full hover:bg-white/10" data-testid="button-prev-month">
              <ChevronLeft size={16} className="text-muted-foreground" />
            </button>
            <p className="text-sm text-muted-foreground min-w-[120px] text-center">{monthDisplay}</p>
            <button onClick={goToNextMonth} className="p-1 rounded-full hover:bg-white/10" data-testid="button-next-month">
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>
          <p className="text-sm text-blue-400 mt-1">{t('totalSavings')}: {formatCurrency(totalSavings)}</p>
        </div>
        {isCurrentMonth && <AddSavingDialog open={isOpen} onOpenChange={setIsOpen} />}
      </div>

      {!isCurrentMonth && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center mb-4">
          <p className="text-yellow-400 text-sm">
            {language === 'BN' ? 'আগের মাসের ডাটা (শুধুমাত্র দেখার জন্য)' : 'Previous month data (read-only)'}
          </p>
        </div>
      )}

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
              data-testid={`saving-item-${item.id}`}
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
                <p className="font-bold text-lg text-blue-400">{formatCurrency(item.amount)}</p>
                {isCurrentMonth && (
                  <button 
                    onClick={() => confirm(language === 'BN' ? "মুছে ফেলতে চান?" : "Delete this saving?") && deleteSaving.mutate(item.id)} 
                    className="text-xs text-muted-foreground hover:text-red-400 transition-colors mt-1"
                    data-testid={`button-delete-${item.id}`}
                  >
                    {language === 'BN' ? 'মুছুন' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AddSavingDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { t, language } = useI18n();
  const createSaving = useCreateSaving();

  const form = useForm<SavingForm>({
    resolver: zodResolver(savingSchema),
    defaultValues: {
      amount: 0,
      purpose: "",
      date: new Date(),
      note: "",
    },
  });

  const onSubmit = (data: SavingForm) => {
    createSaving.mutate({
      ...data,
      date: data.date.toISOString(),
    }, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" className="h-9 w-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20" data-testid="button-add-saving">
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
                    <Input {...field} className="bg-black/20 border-white/10" placeholder={language === 'BN' ? 'যেমন: নতুন ফোন' : 'e.g. New Phone'} data-testid="input-purpose" />
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
                    <Input type="number" {...field} className="bg-black/20 border-white/10" data-testid="input-amount" />
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
                    <Input {...field} value={field.value || ''} className="bg-black/20 border-white/10" placeholder={language === 'BN' ? 'ঐচ্ছিক' : 'Optional'} data-testid="input-note" />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold" 
              disabled={createSaving.isPending}
              data-testid="button-submit-saving"
            >
              {createSaving.isPending ? "Adding..." : t('save')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
