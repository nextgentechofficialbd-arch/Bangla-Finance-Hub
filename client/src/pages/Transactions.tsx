import { useState } from "react";
import { useTransactions, useCreateTransaction, useDeleteTransaction, useCategories, usePaymentMethods } from "@/hooks/use-finance";
import { useI18n } from "@/lib/i18n";
import { format, subMonths, addMonths } from "date-fns";
import { bn, enUS } from "date-fns/locale";
import { Plus, Trash2, TrendingUp, TrendingDown, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { getCurrentMonth, getMonthKey } from "@/lib/db";
import clsx from "clsx";

const transactionSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  amount: z.coerce.number().min(1, "Amount is required"),
  date: z.coerce.date(),
  categoryId: z.coerce.number().optional(),
  paymentMethod: z.string().default("Cash"),
  note: z.string().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export default function Transactions() {
  const { t, language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = getMonthKey(currentDate);
  const isCurrentMonth = currentMonth === getCurrentMonth();
  
  const { data: transactions, isLoading } = useTransactions({ 
    month: currentMonth,
    type: filterType === "ALL" ? undefined : filterType 
  });
  const deleteTransaction = useDeleteTransaction();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'BN' ? 'bn-BD' : 'en-BD', { 
      style: 'currency', 
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleDelete = (id: number) => {
    if (confirm(language === 'BN' ? "আপনি কি নিশ্চিত?" : "Are you sure?")) {
      deleteTransaction.mutate(id);
    }
  };

  const goToPrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const locale = language === 'BN' ? bn : enUS;
  const monthDisplay = format(currentDate, "MMMM yyyy", { locale });

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{t('transactions')}</h1>
          <div className="flex items-center gap-2 mt-1">
            <button onClick={goToPrevMonth} className="p-1 rounded-full hover:bg-white/10" data-testid="button-prev-month">
              <ChevronLeft size={16} className="text-muted-foreground" />
            </button>
            <p className="text-sm text-muted-foreground min-w-[120px] text-center">{monthDisplay}</p>
            <button onClick={goToNextMonth} className="p-1 rounded-full hover:bg-white/10" data-testid="button-next-month">
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-28 bg-card border-white/10 h-9 text-xs" data-testid="select-filter-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{language === 'BN' ? 'সব' : 'All'}</SelectItem>
              <SelectItem value="INCOME">{t('income')}</SelectItem>
              <SelectItem value="EXPENSE">{t('expense')}</SelectItem>
            </SelectContent>
          </Select>
          {isCurrentMonth && <AddTransactionDialog open={isOpen} onOpenChange={setIsOpen} />}
        </div>
      </div>

      {!isCurrentMonth && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-center mb-4">
          <p className="text-yellow-400 text-sm">
            {language === 'BN' ? 'আগের মাসের ডাটা (শুধুমাত্র দেখার জন্য)' : 'Previous month data (read-only)'}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : transactions?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">{t('noData')}</div>
        ) : (
          transactions?.map((tx, idx) => (
            <div 
              key={tx.id} 
              className="bg-card/50 border border-white/5 p-4 rounded-xl flex items-center justify-between animate-in hover:bg-card/80 transition-colors"
              style={{ animationDelay: `${idx * 50}ms` }}
              data-testid={`transaction-item-${tx.id}`}
            >
              <div className="flex items-center gap-4">
                <div className={clsx(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  tx.type === "INCOME" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                )}>
                  {tx.type === "INCOME" ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                </div>
                <div>
                  <h4 className="font-medium">{tx.note || tx.paymentMethod}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{format(new Date(tx.date), "dd MMM, yyyy")}</span>
                    <span>-</span>
                    <span>{tx.paymentMethod}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={clsx(
                  "font-bold",
                  tx.type === "INCOME" ? "text-emerald-400" : "text-white"
                )}>
                  {tx.type === "INCOME" ? "+" : "-"} {formatCurrency(tx.amount)}
                </span>
                {isCurrentMonth && (
                  <button 
                    onClick={() => handleDelete(tx.id)} 
                    className="text-muted-foreground hover:text-red-400 transition-colors"
                    data-testid={`button-delete-${tx.id}`}
                  >
                    <Trash2 size={16} />
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

function AddTransactionDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { t, language } = useI18n();
  const createTransaction = useCreateTransaction();
  const { data: categories } = useCategories();
  const { data: paymentMethods } = usePaymentMethods();

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "EXPENSE",
      amount: 0,
      paymentMethod: "Cash",
      date: new Date(),
      note: "",
    },
  });

  const onSubmit = (data: TransactionForm) => {
    createTransaction.mutate({
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
        <Button size="icon" className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90" data-testid="button-add-transaction">
          <Plus size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 text-foreground w-[90%] max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t('addTransaction')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-black/20 border-white/10" data-testid="select-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INCOME">{t('income')}</SelectItem>
                        <SelectItem value="EXPENSE">{t('expense')}</SelectItem>
                      </SelectContent>
                    </Select>
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
            </div>

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('category')}</FormLabel>
                  <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger className="bg-black/20 border-white/10" data-testid="select-category">
                        <SelectValue placeholder={language === 'BN' ? 'ক্যাটাগরি নির্বাচন করুন' : 'Select category'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('paymentMethod')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-black/20 border-white/10" data-testid="select-payment-method">
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethods?.map(pm => (
                        <SelectItem key={pm.id} value={pm.name}>{pm.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{t('date')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal bg-black/20 border-white/10",
                            !field.value && "text-muted-foreground"
                          )}
                          data-testid="button-date-picker"
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
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
                    <Input {...field} value={field.value || ''} className="bg-black/20 border-white/10" placeholder={language === 'BN' ? 'ঐচ্ছিক নোট' : 'Optional note'} data-testid="input-note" />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" 
              disabled={createTransaction.isPending}
              data-testid="button-submit-transaction"
            >
              {createTransaction.isPending ? "Adding..." : t('save')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
