import { useState } from "react";
import { useContacts, useCreateContact, useDeleteContact } from "@/hooks/use-finance";
import { useI18n } from "@/lib/i18n";
import { Plus, Phone, User as UserIcon, ArrowRightLeft } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import clsx from "clsx";

export default function Contacts() {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const { data: contacts, isLoading } = useContacts();
  const deleteContact = useDeleteContact();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(amount);
  };

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('contacts')}</h1>
        <AddContactDialog open={isOpen} onOpenChange={setIsOpen} />
      </div>

      <div className="grid gap-3">
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">Loading...</div>
        ) : contacts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground opacity-50">
             <ArrowRightLeft size={48} className="mb-4" />
             <p>{t('noData')}</p>
          </div>
        ) : (
          contacts?.map((contact, idx) => (
            <div 
              key={contact.id} 
              className={clsx(
                "border p-4 rounded-xl flex items-center justify-between animate-in transition-all",
                contact.type === "RECEIVABLE" 
                  ? "bg-emerald-950/20 border-emerald-500/20" 
                  : "bg-red-950/20 border-red-500/20"
              )}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  contact.type === "RECEIVABLE" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                )}>
                  <UserIcon size={20} />
                </div>
                <div>
                  <h4 className="font-bold">{contact.name}</h4>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone size={10} />
                    <span>{contact.phone}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={clsx("font-bold", contact.type === "RECEIVABLE" ? "text-emerald-400" : "text-red-400")}>
                  {contact.type === "RECEIVABLE" ? t('receivable') : t('payable')}
                </p>
                <p className="font-mono text-lg">{formatCurrency(Number(contact.amount))}</p>
                <button 
                  onClick={() => confirm("Delete this contact?") && deleteContact.mutate(contact.id)}
                  className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function AddContactDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { t } = useI18n();
  const createContact = useCreateContact();

  const formSchema = insertContactSchema.extend({
    amount: z.coerce.number().min(1),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "PAYABLE",
      amount: 0,
      name: "",
      phone: "",
      status: "PENDING",
      paidAmount: "0"
    },
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
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
        <Button size="icon" className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
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
                        <SelectTrigger className="bg-black/20 border-white/10">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PAYABLE">{t('payable')}</SelectItem>
                        <SelectItem value="RECEIVABLE">{t('receivable')}</SelectItem>
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
                      <Input type="number" {...field} className="bg-black/20 border-white/10" />
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
                    <Input {...field} className="bg-black/20 border-white/10" />
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
                    <Input {...field} value={field.value || ''} className="bg-black/20 border-white/10" />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" disabled={createContact.isPending}>
              {createContact.isPending ? "Adding..." : t('save')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
