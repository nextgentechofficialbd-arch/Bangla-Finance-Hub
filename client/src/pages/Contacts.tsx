import { useState } from "react";
import { useContacts, useCreateContact, useDeleteContact, useUpdateContact } from "@/hooks/use-finance";
import { useI18n } from "@/lib/i18n";
import { Plus, Phone, User as UserIcon, ArrowRightLeft, Edit2, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import clsx from "clsx";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  type: z.enum(['PAYABLE', 'RECEIVABLE']),
  amount: z.coerce.number().min(1, "Amount is required"),
  paidAmount: z.coerce.number().default(0),
  status: z.enum(['PENDING', 'PARTIAL', 'PAID']).default('PENDING'),
  dueDate: z.string().optional(),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Contacts() {
  const { t, language } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("ALL");
  const { data: contacts, isLoading } = useContacts();
  const deleteContact = useDeleteContact();
  const updateContact = useUpdateContact();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'BN' ? 'bn-BD' : 'en-BD', { 
      style: 'currency', 
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredContacts = contacts?.filter(c => 
    filterType === "ALL" || c.type === filterType
  ) || [];

  const totalPayable = contacts?.filter(c => c.type === 'PAYABLE' && c.status !== 'PAID')
    .reduce((sum, c) => sum + (c.amount - c.paidAmount), 0) || 0;
  
  const totalReceivable = contacts?.filter(c => c.type === 'RECEIVABLE' && c.status !== 'PAID')
    .reduce((sum, c) => sum + (c.amount - c.paidAmount), 0) || 0;

  const handleMarkAsPaid = (id: number) => {
    const contact = contacts?.find(c => c.id === id);
    if (contact) {
      updateContact.mutate({ 
        id, 
        data: { 
          paidAmount: contact.amount, 
          status: 'PAID' 
        } 
      });
    }
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">{t('contacts')}</h1>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-red-400">{t('payable')}: {formatCurrency(totalPayable)}</span>
            <span className="text-emerald-400">{t('receivable')}: {formatCurrency(totalReceivable)}</span>
          </div>
        </div>
        <AddContactDialog open={isOpen} onOpenChange={setIsOpen} />
      </div>

      <div className="flex gap-2 mb-4">
        {['ALL', 'PAYABLE', 'RECEIVABLE'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filterType === type 
                ? "bg-primary text-primary-foreground" 
                : "bg-card border border-white/10 text-muted-foreground hover:text-white"
            )}
            data-testid={`filter-${type.toLowerCase()}`}
          >
            {type === 'ALL' ? (language === 'BN' ? 'সব' : 'All') : 
             type === 'PAYABLE' ? t('payable') : t('receivable')}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground opacity-50">
            <ArrowRightLeft size={48} className="mb-4" />
            <p>{t('noData')}</p>
          </div>
        ) : (
          filteredContacts.map((contact, idx) => (
            <div 
              key={contact.id} 
              className={clsx(
                "border p-4 rounded-xl flex items-center justify-between animate-in transition-all",
                contact.status === 'PAID' 
                  ? "bg-gray-900/50 border-gray-500/20 opacity-60"
                  : contact.type === "RECEIVABLE" 
                    ? "bg-emerald-950/20 border-emerald-500/20" 
                    : "bg-red-950/20 border-red-500/20"
              )}
              style={{ animationDelay: `${idx * 50}ms` }}
              data-testid={`contact-item-${contact.id}`}
            >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  contact.status === 'PAID' 
                    ? "bg-gray-500/20 text-gray-400"
                    : contact.type === "RECEIVABLE" 
                      ? "bg-emerald-500/20 text-emerald-400" 
                      : "bg-red-500/20 text-red-400"
                )}>
                  <UserIcon size={20} />
                </div>
                <div>
                  <h4 className="font-bold">{contact.name}</h4>
                  {contact.phone && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone size={10} />
                      <span>{contact.phone}</span>
                    </div>
                  )}
                  {contact.status === 'PARTIAL' && (
                    <span className="text-xs text-yellow-400">
                      {language === 'BN' ? 'আংশিক পরিশোধ' : 'Partially paid'}
                    </span>
                  )}
                  {contact.status === 'PAID' && (
                    <span className="text-xs text-gray-400">
                      {language === 'BN' ? 'সম্পূর্ণ পরিশোধিত' : 'Fully paid'}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={clsx(
                  "font-bold", 
                  contact.status === 'PAID' 
                    ? "text-gray-400"
                    : contact.type === "RECEIVABLE" 
                      ? "text-emerald-400" 
                      : "text-red-400"
                )}>
                  {contact.type === "RECEIVABLE" ? t('receivable') : t('payable')}
                </p>
                <p className="font-mono text-lg">
                  {formatCurrency(contact.amount - contact.paidAmount)}
                  {contact.paidAmount > 0 && contact.status !== 'PAID' && (
                    <span className="text-xs text-muted-foreground ml-1">
                      / {formatCurrency(contact.amount)}
                    </span>
                  )}
                </p>
                <div className="flex gap-2 mt-2 justify-end">
                  {contact.status !== 'PAID' && (
                    <button 
                      onClick={() => handleMarkAsPaid(contact.id)}
                      className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded hover:bg-emerald-500/30 transition-colors"
                      data-testid={`button-mark-paid-${contact.id}`}
                    >
                      <Check size={12} className="inline mr-1" />
                      {language === 'BN' ? 'পরিশোধিত' : 'Paid'}
                    </button>
                  )}
                  <button 
                    onClick={() => confirm(language === 'BN' ? "মুছে ফেলতে চান?" : "Delete this contact?") && deleteContact.mutate(contact.id)}
                    className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors"
                    data-testid={`button-delete-${contact.id}`}
                  >
                    <X size={12} className="inline" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AddContactDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { t, language } = useI18n();
  const createContact = useCreateContact();

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      type: "PAYABLE",
      amount: 0,
      name: "",
      phone: "",
      status: "PENDING",
      paidAmount: 0,
    },
  });

  const onSubmit = (data: ContactForm) => {
    createContact.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground" data-testid="button-add-contact">
          <Plus size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-white/10 text-foreground w-[90%] max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>{t('addContact')}</DialogTitle>
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
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PAYABLE">{t('payable')} ({language === 'BN' ? 'দিতে হবে' : 'I owe'})</SelectItem>
                        <SelectItem value="RECEIVABLE">{t('receivable')} ({language === 'BN' ? 'পেতে হবে' : 'Owed to me'})</SelectItem>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                  <FormControl>
                    <Input {...field} className="bg-black/20 border-white/10" placeholder={language === 'BN' ? 'ব্যক্তির নাম' : 'Person name'} data-testid="input-name" />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('phone')}</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ''} className="bg-black/20 border-white/10" placeholder="01XXXXXXXXX" data-testid="input-phone" />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" 
              disabled={createContact.isPending}
              data-testid="button-submit-contact"
            >
              {createContact.isPending ? "Adding..." : t('save')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
